import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  DialogTitle,
  DialogContent,
  Dialog,
  DialogProps,
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
import { cloneDeep } from 'lodash';
import { RapidVariantType } from '../../types';
import { getVariantRelevanceDict, RESTRICTED_RELEVANCE_LIST } from '../../utils';
import { UNSPECIFIED_EVIDENCE_LEVEL } from '../../common';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const condenseMatches = (matches: KbMatchedStatementType[]) => {
  const grouped: Record<string, Record<string, KbMatchedStatementType[]>> = {};

  matches.forEach((item) => {
    const { context, iprEvidenceLevel } = item;
    let evidenceLevel = iprEvidenceLevel;
    if (!iprEvidenceLevel) {
      evidenceLevel = UNSPECIFIED_EVIDENCE_LEVEL;
    }

    if (!grouped[context]) {
      grouped[context] = {};
    }

    if (!grouped[context][evidenceLevel]) {
      grouped[context][evidenceLevel] = [];
    }

    grouped[context][evidenceLevel].push(item);
  });

  return grouped;
};

const separateNoTable = (groupedData, variantIdent, variantType) => {
  const noTable = {};
  const hasTable = {};
  const trimmedVariantIdent = UUID_REGEX.test(variantIdent)
    ? variantIdent
    : variantIdent.split('-').slice(0, 5).join('-');

  Object.entries(groupedData).forEach(([context, iprLevels]) => {
    Object.entries(iprLevels).forEach(([iprLevel, entries]) => {
      // Fix for-in error of eslint
      const { noTableEntries, otherEntries } = entries.reduce(
        (acc, entry) => {
          const noTableList = entry?.kbData?.rapidReportTableTag?.noTable?.[variantType] || [];

          if (noTableList.includes(trimmedVariantIdent)) {
            acc.noTableEntries.push(entry);
          } else {
            acc.otherEntries.push(entry);
          }

          return acc;
        },
        { noTableEntries: [], otherEntries: [] },
      );

      if (noTableEntries.length) {
        noTable[context] ??= {};
        noTable[context][iprLevel] = noTableEntries;
      }

      if (otherEntries.length) {
        hasTable[context] ??= {};
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

    if (iprLevels.length === 0) {
      iprLevels.push(UNSPECIFIED_EVIDENCE_LEVEL);
    }
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

  const parseIpr = (ipr) => {
    if (!ipr?.startsWith('IPR-')) return null;
    const [, level] = ipr.split('-');
    return level;
  };

  const levelA = parseIpr(iprA);
  const levelB = parseIpr(iprB);

  // Non-IPR go last
  if (levelA === null && levelB !== null) return 1;
  if (levelB === null && levelA !== null) return -1;
  if (levelA === null && levelB === null) { return keyA.toLowerCase().localeCompare(keyB.toLowerCase()); }

  const levelCmp = levelA.localeCompare(levelB);
  if (levelCmp !== 0) return levelCmp;

  return keyA.toLowerCase().localeCompare(keyB.toLowerCase());
};

type KbMatchesTableProps = {
  kbMatches: KbMatchType[];
  variantIdent: string;
  variantType: string;
  onDelete: (idents: string[], relevance: KbMatchedStatementType['relevance']) => void;
};

const KbMatchesTable = ({
  kbMatches, variantIdent, variantType, onDelete,
}: KbMatchesTableProps) => {
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
          if (
            statement.relevance === relevance
            && !RESTRICTED_RELEVANCE_LIST.includes(statement.relevance)
          ) {
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

  const handleKbMatchesToggle = useCallback((idents, relevance) => () => {
    if (onDelete && idents.length) {
      onDelete(idents, relevance);
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
        const { noTable, hasTable } = separateNoTable(condensedMatches, variantIdent, variantType);
        const highest = keepHighestIprPerContext(hasTable);

        return (
          <React.Fragment key={relevance + relevanceMatches.toString()}>
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
                        key={`${key}-${firstFlatEntry.iprEvidenceLevel}-${relevance}`}
                        label={`${key} (${firstFlatEntry.iprEvidenceLevel ? firstFlatEntry.iprEvidenceLevel : UNSPECIFIED_EVIDENCE_LEVEL})`}
                        deleteIcon={<DeleteIcon />}
                        onDelete={handleKbMatchesToggle(idents, relevance)}
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
                        key={`${key}-${iprLevel}-${relevance}-'noTable'`}
                        label={`${key} ${iprLevel ? `(${iprLevel})` : UNSPECIFIED_EVIDENCE_LEVEL}`}
                        deleteIcon={<DeleteIcon />}
                        onDelete={handleKbMatchesToggle(idents, relevance)}
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
  }, [sortedStatements, variantIdent, variantType, handleKbMatchesToggle]);

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

enum FIELDS {
  'kbMatches',
}

interface RapidVariantEditDialogProps extends DialogProps {
  editData: RapidVariantType & { potentialClinicalAssociation?: string };
  onClose: (newData: boolean) => void;
  fields?: Array<FIELDS>;
}

const RapidVariantEditDialog = ({
  onClose,
  open,
  editData,
  fields = [],
}: RapidVariantEditDialogProps) => {
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
        const calls = [];

        if (fields.includes(FIELDS.kbMatches) && data?.kbMatches && editData?.kbMatches) {
          // strip the context-related tag that has been added to the ident for coalescing
          const variantIdent = (() => {
            const lastHyphenIndex = data.ident.lastIndexOf('-');
            if (lastHyphenIndex === -1) return data.ident;

            const uuid = data.ident.slice(0, lastHyphenIndex);
            return UUID_REGEX.test(uuid) ? uuid : data.ident;
          })();
          noTableSet.forEach((ident) => {
            calls.push(api.post(`/reports/${report.ident}/variants/set-statement-summary-table`, {
              variantIdent,
              variantType: data.variantType,
              rapidReportTableTag: 'noTable',
              kbStatementIds: [ident],
            }));
          });
          tableTypeSet.forEach((ident) => {
            calls.push(api.post(`/reports/${report.ident}/variants/set-statement-summary-table`, {
              variantIdent,
              variantType: data.variantType,
              rapidReportTableTag: 'therapeuticAssociation',
              kbStatementIds: [ident],
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
      } finally {
        setIsApiCalling(false);
      }
    } else {
      onClose(null);
    }
  }, [editDataDirty, tableTypeSet, noTableSet, data, fields, editData?.kbMatches, isSigned, report.ident, showConfirmDialog, onClose]);

  const handleDialogClose = useCallback(() => onClose(null), [onClose]);

  const handleKbMatchToggle = useCallback((kbMatchStatementIds, relevance) => {
    if (!data || !data.ident) { return; }
    const { variantType, ident: variantIdent } = data;
    // Find all kbMatches with that ident
    const trimmedVariantIdent = UUID_REGEX.test(variantIdent) ? variantIdent : variantIdent.split('-').slice(0, 5).join('-');
    const updatedKbMatches = data?.kbMatches.map((kbMatch: KbMatchType) => {
      const statementsToToggle = kbMatch.kbMatchedStatements
        .map((stmt) => {
          if (!kbMatchStatementIds.includes(stmt.ident)) {
            return stmt;
          }
          if (stmt.relevance !== relevance) {
            return stmt;
          }

          const nextStmt = cloneDeep(stmt);
          nextStmt.kbData = nextStmt.kbData || {};
          nextStmt.kbData.rapidReportTableTag = nextStmt.kbData.rapidReportTableTag || {};

          // get the current tag:
          // using this tag as the default because an untagged stmt is treated the same way
          let currentTag = 'therapeuticAssociation';
          for (const key of Object.keys(nextStmt.kbData.rapidReportTableTag)) {
            // only need to check the therapeuticAssociation and noTable tags
            const variantTypesDict = nextStmt.kbData.rapidReportTableTag[key] || {};
            const variantIdentList = variantType in variantTypesDict
              ? variantTypesDict[variantType]
              : [];
            if (variantIdentList.includes(trimmedVariantIdent)) {
              currentTag = key;
            }
          }

          // untagged and therapeuticAssociation are treated the same way, as show
          // noTable and any other tag are treated the same way, as don't show

          let newTag = 'noTable';
          if (currentTag !== 'therapeuticAssociation') {
            newTag = 'therapeuticAssociation';
          }
          // unset old tag...
          for (const tableKey of Object.keys(nextStmt.kbData.rapidReportTableTag)) {
            const typeMap = nextStmt.kbData.rapidReportTableTag[tableKey] || {};
            if (Array.isArray(typeMap?.[variantType])) {
              typeMap[variantType] = typeMap[variantType].filter((id) => id !== trimmedVariantIdent);
            }
          }
          // set new tag
          if (!nextStmt.kbData.rapidReportTableTag[newTag]) {
            nextStmt.kbData.rapidReportTableTag[newTag] = { [variantType]: [trimmedVariantIdent] };
          } else {
            const tableEntry = nextStmt.kbData.rapidReportTableTag[newTag];
            tableEntry[variantType] = tableEntry[variantType] || [];
            if (!tableEntry[variantType].includes(trimmedVariantIdent)) {
              tableEntry[variantType].push(trimmedVariantIdent);
            }
          }
          // currently this will only set as noTable or therapeutic
          if (newTag === 'noTable') {
            noTableSet.add(stmt.ident);
            tableTypeSet.delete(stmt.ident);
          } else {
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
  }, [data, handleDataChange, noTableSet, tableTypeSet]);

  const kbMatchesField = useMemo(() => {
    if (!fields.includes(FIELDS.kbMatches)) {
      return null;
    }
    return (
      <KbMatchesTable kbMatches={data?.kbMatches} variantIdent={data?.ident} variantType={data?.variantType} onDelete={handleKbMatchToggle} />
    );
  }, [data?.ident, data?.kbMatches, data?.variantType, fields, handleKbMatchToggle]);

  return (
    <Dialog fullWidth maxWidth="xl" open={open}>
      <DialogTitle>
        Edit Variant
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        {kbMatchesField}
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
