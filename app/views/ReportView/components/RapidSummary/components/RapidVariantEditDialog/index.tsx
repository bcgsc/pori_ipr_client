import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  DialogTitle,
  DialogContent,
  Dialog,
  DialogProps,
  TextField,
  DialogActions,
  Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import AsyncButton from '@/components/AsyncButton';
import snackbar from '@/services/SnackbarUtils';
import DeleteIcon from '@mui/icons-material/HighlightOff';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import api, { ApiCallSet } from '@/services/api';
import { KbMatchedStatementType, KbMatchType } from '@/common';
import { Box } from '@mui/system';
import { RapidVariantType } from '../../types';
import { getVariantRelevanceDict } from '../../utils';

const condenseMatches = (matches: KbMatchedStatementType[]) => {
  const grouped = {};

  matches.forEach((item) => {
    const { context, iprEvidenceLevel } = item;

    if (!grouped[context]) {
      grouped[context] = {};
    }

    if (!grouped[context][iprEvidenceLevel]) {
      grouped[context][iprEvidenceLevel] = [];
    }

    grouped[context][iprEvidenceLevel].push(item);
  });

  return grouped;
};

const separateNoTable = (groupedData) => {
  const noTable = {};
  const hasTable = {};

  Object.entries(groupedData).forEach(([context, iprLevels]) => {
    Object.entries(iprLevels).forEach(([iprLevel, entries]) => {
      const noTableEntries = entries.filter(
        (item) => item.kbData?.rapidReportTableTag === 'noTable',
      );
      const otherEntries = entries.filter(
        (item) => item.kbData?.rapidReportTableTag !== 'noTable',
      );

      if (noTableEntries.length > 0) {
        if (!noTable[context]) noTable[context] = {};
        noTable[context][iprLevel] = noTableEntries;
      }

      if (otherEntries.length > 0) {
        if (!hasTable[context]) hasTable[context] = {};
        hasTable[context][iprLevel] = otherEntries;
      }
    });
  });

  return { noTable, hasTable };
};

const keepHighestIprPerContext = (groupedData) => {
  const result = {};

  Object.entries(groupedData).forEach(([context, iprMap]) => {
    const iprLevels = Object.keys(iprMap);

    if (iprLevels.length === 0) return;

    const [highest] = iprLevels.sort();

    result[context] = {
      [highest]: iprMap[highest],
    };
  });

  return result;
};

const sortByIprThenName = ([keyA, valA], [keyB, valB]) => {
  const [iprA] = Object.keys(valA);
  const [iprB] = Object.keys(valB);

  const [, levelA] = iprA.split('-');
  const [, levelB] = iprB.split('-');

  const levelCmp = levelA.localeCompare(levelB);
  if (levelCmp !== 0) return levelCmp;

  return keyA.toLowerCase().localeCompare(keyB.toLowerCase());
};

type KbMatchesTableProps = {
  kbMatches: KbMatchType[];
  onDelete: (idents: string[]) => void;
};

const KbMatchesTable = ({ kbMatches, onDelete }: KbMatchesTableProps) => {
  const [editingMatches, setEditingMatches] = useState(kbMatches);
  useEffect(() => {
    if (kbMatches) {
      setEditingMatches(kbMatches);
    }
  }, [kbMatches]);

  const sortedStatements = useMemo(() => {
    if (!editingMatches) {
      return null;
    }

    const variantRelDict = getVariantRelevanceDict(editingMatches);
    const sorted = {};
    Object.entries(variantRelDict).forEach(([relevance, matches]) => {
      matches.forEach((match) => {
        for (const statement of match.kbMatchedStatements) {
          if (!sorted[relevance]) {
            sorted[relevance] = [statement];
          } else if (!sorted[relevance].some((item: KbMatchedStatementType) => item.ident === statement.ident)) {
            sorted[relevance].push(statement);
          }
        }
      });
    });
    return sorted;
  }, [editingMatches]);

  const handleKbMatchesToggle = useCallback((idents) => () => {
    if (onDelete && idents.length) {
      onDelete(idents);
    }
  }, [onDelete]);

  const kbMatchesInnerTable = useMemo(() => {
    if (!sortedStatements) { return null; }
    return Object.entries(sortedStatements)
      .sort(([relevance1], [relevance2]) => (relevance1 > relevance2 ? 1 : -1)) // Sorts by relevance alphabetically
      .map(([relevance, matches]: [relevance: string, matches: KbMatchedStatementType[]]) => {
        const condensedMatches = condenseMatches(matches);
        const { noTable, hasTable } = separateNoTable(condensedMatches);
        const highest = keepHighestIprPerContext(hasTable);
        return (
          <React.Fragment key={relevance + matches.toString()}>
            <TableRow>
              <TableCell rowSpan={2}>{relevance}</TableCell>
              <TableCell>Shown</TableCell>
              <TableCell>
                {
                  Object.entries(highest).sort(sortByIprThenName).map(([key, val]) => {
                    const flattenedEntry = Object.values(val).flat();
                    const [firstFlatEntry] = flattenedEntry;
                    const idents = flattenedEntry.map((stmt) => stmt.ident);

                    return (
                      <Chip
                        key={`${key}-${firstFlatEntry.iprEvidenceLevel}`}
                        label={`${key} ${firstFlatEntry.iprEvidenceLevel ? `(${firstFlatEntry.iprEvidenceLevel})` : ''}`}
                        deleteIcon={<DeleteIcon />}
                        onDelete={handleKbMatchesToggle(idents)}
                      />
                    );
                  })
                }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Not Shown</TableCell>
              <TableCell>
                {
                  Object.entries(noTable).sort(sortByIprThenName).map(([key, val]) => Object.entries(val).map(([iprLevel, statements]) => {
                    const idents = statements.map(({ ident }) => ident);
                    return (
                      <Chip
                        key={`${key}-${iprLevel}-'noTable'`}
                        label={`${key} ${iprLevel ? `(${iprLevel})` : ''}`}
                        deleteIcon={<DeleteIcon />}
                        onDelete={handleKbMatchesToggle(idents)}
                        sx={{ '& .MuiChip-label': { textDecoration: 'line-through' } }}
                      />
                    );
                  }))
                }
              </TableCell>
            </TableRow>
          </React.Fragment>
        );
      });
  }, [sortedStatements, handleKbMatchesToggle]);

  return (
    <Box my={1}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#ddd' }}>
            <TableRow>
              <TableCell>Relevance</TableCell>
              <TableCell />
              <TableCell>Drugs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kbMatchesInnerTable}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const VARIANT_TYPE_TO_API_MAP = {
  cnv: 'copy-variants',
  mut: 'small-mutations',
  sv: 'structural-variants',
  tmb: 'tmbur_mutation_burden',
};

enum FIELDS {
  'comments',
  'kbMatches',
}

interface VariantEditDialogProps extends DialogProps {
  editData: RapidVariantType & { potentialClinicalAssociation?: string };
  rapidVariantTableType: KbMatchedStatementType['kbData']['rapidReportTableTag'];
  onClose: (newData: boolean) => void;
  fields?: Array<FIELDS>;
}

const RapidVariantEditDialog = ({
  onClose,
  open,
  editData,
  rapidVariantTableType,
  fields = [FIELDS.comments],
}: VariantEditDialogProps) => {
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const [data, setData] = useState(editData);
  const [editDataDirty, setEditDataDirty] = useState<boolean>(false);
  const [isApiCalling, setIsApiCalling] = useState(false);

  const [noTableSet] = useState(new Set());
  const [tableTypeSet] = useState(new Set());

  useEffect(() => {
    if (editData) {
      setData(editData);
    }
    if (!open) {
      setIsApiCalling(false);
    }
  }, [editData, open]);

  const handleDataChange = useCallback((
    { target: { value, name } },
  ) => {
    setData((prevVal) => ({ ...prevVal, [name]: value }));
    if (!editDataDirty) {
      setEditDataDirty(true);
    }
  }, [editDataDirty]);

  const handleSave = useCallback(async () => {
    if (editDataDirty) {
      setIsApiCalling(true);
      try {
        let variantId = data?.ident;
        // The relevance was appeneded to Id due to row concatenation, needs to be removed here to call API
        if ((data).potentialClinicalAssociation) {
          variantId = variantId.substr(0, variantId.lastIndexOf('-'));
        }

        const calls = [];

        if (fields.includes(FIELDS.comments)) {
          calls.push(api.put(
            `/reports/${report.ident}/${VARIANT_TYPE_TO_API_MAP[data.variantType]}/${variantId}`,
            {
              comments: data.comments,
            },
          ));
        }

        if (fields.includes(FIELDS.kbMatches) && data?.kbMatches && editData?.kbMatches) {
          noTableSet.forEach((ident) => {
            calls.push(api.put(`/reports/${report.ident}/kb-matches/kb-matched-statements/${ident}`, {
              kbData: { rapidReportTableTag: 'noTable' },
            }));
          });
          tableTypeSet.forEach((ident) => {
            calls.push(api.put(`/reports/${report.ident}/kb-matches/kb-matched-statements/${ident}`, {
              kbData: { rapidReportTableTag: rapidVariantTableType },
            }));
          });
        }

        const callSet = new ApiCallSet(calls);

        if (isSigned) {
          showConfirmDialog(callSet);
        } else {
          await callSet.request();
          onClose(true);
        }
      } catch (e) {
        snackbar.error(`Error editing variant: ${e.message}`);
        onClose(true);
      }
    } else {
      onClose(null);
    }
  }, [editDataDirty, tableTypeSet, noTableSet, data?.ident, data?.potentialClinicalAssociation, data?.comments, data?.kbMatches, data?.variantType, fields, editData?.kbMatches, isSigned, report.ident, rapidVariantTableType, showConfirmDialog, onClose]);

  const handleDialogClose = useCallback(() => onClose(null), [onClose]);

  const handleKbMatchToggle = useCallback((kbMatchStatementIds) => {
    // Find all kbMatches with that ident
    const updatedKbMatches = data?.kbMatches.map((kbMatch: KbMatchType) => {
      const statementsToToggle = kbMatch.kbMatchedStatements
        .map((stmt) => {
          if (!kbMatchStatementIds.includes(stmt.ident)) {
            return stmt;
          }
          const nextStmt = stmt;
          const { rapidReportTableTag } = nextStmt.kbData;
          if (rapidReportTableTag !== 'noTable') {
            nextStmt.kbData.rapidReportTableTag = 'noTable';
            noTableSet.add(stmt.ident);
            tableTypeSet.delete(stmt.ident);
          } else {
            nextStmt.kbData.rapidReportTableTag = rapidVariantTableType;
            noTableSet.delete(stmt.ident);
            tableTypeSet.add(stmt.ident);
          }
          return nextStmt;
        });
      return { ...kbMatch, kbMatchedStatements: statementsToToggle };
    });
    handleDataChange({
      target: {
        value: updatedKbMatches,
        name: 'kbMatches',
      },
    });
  }, [data?.kbMatches, handleDataChange, noTableSet, rapidVariantTableType, tableTypeSet]);

  const kbMatchesField = useMemo(() => {
    if (!fields.includes(FIELDS.kbMatches)) {
      return null;
    }
    return (
      <KbMatchesTable kbMatches={data?.kbMatches} onDelete={handleKbMatchToggle} />
    );
  }, [data?.kbMatches, fields, handleKbMatchToggle]);

  const disableCommentField = !fields.includes(FIELDS.comments) || ['tmb', 'signature'].includes(editData?.variantType);

  return (
    <Dialog fullWidth maxWidth="xl" open={open}>
      <DialogTitle>
        Edit Event
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        {kbMatchesField}
        <TextField
          className="patient-dialog__text-field"
          label="comments"
          value={data?.comments ?? ''}
          name="comments"
          onChange={handleDataChange}
          variant="outlined"
          disabled={disableCommentField}
          multiline
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>
          Close
        </Button>
        <AsyncButton isLoading={isApiCalling} color="secondary" onClick={handleSave}>
          Save Changes
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export {
  RapidVariantEditDialog,
  FIELDS,
};
export default RapidVariantEditDialog;
