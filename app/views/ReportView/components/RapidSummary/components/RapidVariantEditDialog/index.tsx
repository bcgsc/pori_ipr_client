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
  const grouped: Record<string, Record<string, KbMatchedStatementType[]>> = {};

  matches.forEach((item) => {
    const { context, iprEvidenceLevel } = item;
    if (!iprEvidenceLevel) return;

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

const sortByIprThenName = ([keyA, valA], [keyB, valB]) => {
  const [iprA] = Object.keys(valA);
  const [iprB] = Object.keys(valB);

  const [, levelA] = iprA.split('-');
  const [, levelB] = iprB.split('-');

  const levelCmp = levelA.localeCompare(levelB);
  if (levelCmp !== 0) return levelCmp;

  return keyA.toLowerCase().localeCompare(keyB.toLowerCase());
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

const KbMatchesTable = ({ kbMatches, onDelete }: {
  kbMatches: KbMatchType[],
  onDelete: (ident: string) => void;
}) => {
  const [editingMatches, setEditingMatches] = useState(kbMatches);

  useEffect(() => {
    if (kbMatches) {
      setEditingMatches(kbMatches);
    }
  }, [kbMatches]);

  // Map Relevance to kbMatchedStatements
  const sortedStatements = useMemo(() => {
    if (!editingMatches) {
      return null;
    }

    const variantRelDict = getVariantRelevanceDict(editingMatches);

    const sorted = {};
    Object.entries(variantRelDict).forEach(([relevance, variants]) => {
      variants.forEach((variant) => {
        for (const statement of variant.kbMatchedStatements) {
          if (statement.relevance === relevance) {
            if (!sorted[relevance]) {
              sorted[relevance] = [statement];
            } else if (
              sorted[relevance]
              && !sorted[relevance].some((item: KbMatchedStatementType) => item.ident === statement.ident)
            ) {
              sorted[relevance].push(statement);
            }
          }
        }
      });
    });
    return sorted;
  }, [editingMatches]);

  const handleKbMatchDelete = useCallback((ident) => () => {
    if (onDelete && ident) {
      onDelete(ident);
    }
  }, [onDelete]);

  const kbMatchesInnerTable = useMemo(() => {
    if (!sortedStatements) { return null; }
    return Object.entries(sortedStatements)
      .sort(([relevance1], [relevance2]) => (relevance1 > relevance2 ? 1 : -1)) // Sorts by relevance alphabetically
      .map(([relevance, matches]: [relevance: string, matches: KbMatchedStatementType[]]) => {
        // Only grab matches that is specific to this relevance
        const relevanceMatches = matches.filter((m) => m.relevance === relevance);
        // Condenses kbmatchStatements via drug name
        const condensedMatches = condenseMatches(relevanceMatches);
        const highest = keepHighestIprPerContext(condensedMatches);

        return (
          <React.Fragment key={relevance + relevanceMatches.toString()}>
            <TableRow>
              <TableCell>{relevance}</TableCell>
              <TableCell>
                {
                  Object.entries(highest).sort(sortByIprThenName).map(([key, val]) => {
                    const flattenedEntry = Object.values(val).flat();

                    const [firstFlatEntry] = flattenedEntry;
                    const idents = flattenedEntry.map((stmt) => stmt.ident);
                    return (
                      <Chip
                        key={`${key}-${firstFlatEntry.iprEvidenceLevel}-${relevance}`}
                        label={`${key} ${firstFlatEntry.iprEvidenceLevel ? `(${firstFlatEntry.iprEvidenceLevel})` : ''}`}
                        deleteIcon={<DeleteIcon />}
                        onDelete={handleKbMatchDelete(idents)}
                      />
                    );
                  })
                }
              </TableCell>
            </TableRow>
          </React.Fragment>
        );
      });
  }, [sortedStatements, handleKbMatchDelete]);

  return (
    <Box my={1}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#ddd' }}>
            <TableRow>
              <TableCell>Relevance</TableCell>
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
};

enum FIELDS {
  'comments',
  'kbMatches',
}

interface VariantEditDialogProps extends DialogProps {
  editData: RapidVariantType & { potentialClinicalAssociation?: string };
  onClose: (newData: boolean) => void;
  fields?: Array<FIELDS>;
}

const RapidVariantEditDialog = ({
  onClose,
  open,
  editData,
  fields = [FIELDS.comments],
}: VariantEditDialogProps) => {
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const [data, setData] = useState(editData);
  const [editDataDirty, setEditDataDirty] = useState<boolean>(false);
  const [isApiCalling, setIsApiCalling] = useState(false);

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

  const handleKbMatchDelete = useCallback((kbMatchStatementIds) => {
    const updatedKbMatches = data?.kbMatches.map((kbMatch: KbMatchType) => {
      const updatedStatements = kbMatch.kbMatchedStatements.filter(({ ident }) => !kbMatchStatementIds.includes(ident));
      return { ...kbMatch, kbMatchedStatements: updatedStatements };
    });
    handleDataChange({
      target: {
        value: updatedKbMatches,
        name: 'kbMatches',
      },
    });
  }, [data?.kbMatches, handleDataChange]);

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

        if (fields.includes(FIELDS.comments) && data?.comments) {
          calls.push(api.put(
            `/reports/${report.ident}/${VARIANT_TYPE_TO_API_MAP[data.variantType]}/${variantId}`,
            {
              comments: data.comments,
            },
          ));
        }

        if (fields.includes(FIELDS.kbMatches) && data?.kbMatches && editData?.kbMatches) {
          const initialIdsSet = new Set(
            editData.kbMatches.flatMap((match) => match.kbMatchedStatements.map(({ ident }) => ident)),
          );
          const initialIds = Array.from(initialIdsSet);

          const remainingIdsSet = new Set();

          for (const kbMatch of data.kbMatches) {
            for (const { ident } of kbMatch.kbMatchedStatements) {
              remainingIdsSet.add(ident);
            }
          }

          const idsToDelete = initialIds.filter((initId) => !remainingIdsSet.has(initId));
          idsToDelete.forEach((stmtId) => calls.push(api.del(`/reports/${report.ident}/kb-matches/kb-matched-statements/${stmtId}`, {})));
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
  }, [editDataDirty, data, fields, isSigned, report.ident, editData?.kbMatches, showConfirmDialog, onClose]);

  const handleDialogClose = useCallback(() => onClose(null), [onClose]);

  const kbMatchesField = () => {
    if (!fields.includes(FIELDS.kbMatches)) {
      return null;
    }
    return (
      <KbMatchesTable kbMatches={data?.kbMatches} onDelete={handleKbMatchDelete} />
    );
  };

  return (
    <Dialog fullWidth maxWidth="xl" open={open}>
      <DialogTitle>
        Edit Event
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        {kbMatchesField()}
        <TextField
          className="patient-dialog__text-field"
          label="comments"
          value={data?.comments ?? ''}
          name="comments"
          onChange={handleDataChange}
          variant="outlined"
          disabled={!fields.includes(FIELDS.comments)}
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
