import React, {
  useState, useEffect, useContext, useCallback, useMemo, useRef,
  createRef,
} from 'react';
import {
  TextField,
  InputAdornment,
  MenuItem,
  Menu,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogTitle,
  List,
  ListItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  FilterList,
} from '@mui/icons-material';

import { useDebounce } from 'use-debounce';
import { useMutation } from 'react-query';

import api, { ApiCallPayload, ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import useReport from '@/hooks/useReport';
import DataTable, { DataTableImperativeHandle } from '@/components/DataTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import ReportContext, { ReportType } from '@/context/ReportContext';
import { KbMatchedStatementType } from '@/common';
import { GridApi } from '@ag-grid-community/core';
import { KbMatchesMoveDialogContext, KbMatchesMoveDialogContextType, useKbMatches } from '@/context/KbMatchesMoveDialogContext/KbmatchesMoveDialogContext';
import { ErrorMixin, RecordConflictError } from '@/services/errors/errors';
import { useLocation } from 'react-router-dom';
import { columnDefs, targetedColumnDefs } from './columnDefs';
import { coalesceEntries, getBucketKey } from './coalesce';

import './index.scss';
import ProbeResultsType from '../ProbeSummary/types';

const KB_MATCHES_TITLE_MAP = {
  highEvidence: 'Therapeutic Alterations with High-Level Clinical Evidence in this Tumour Type',
  therapeutic: 'Therapeutic Alterations',
  diagnostic: 'Diagnostic Alterations',
  prognostic: 'Prognostic Alterations',
  biological: 'Biological Alterations',
  unknown: 'Other Alterations',
  targetedGermlineGenes: 'Detected Alterations from Pharmacogenomic and Cancer Predisposition Targeted Gene Report',
  targetedSomaticGenes: 'Detected Alterations From Somatic Targeted Gene Report',
};

const RAPID_TABLE_TITLE_MAP = {
  // Should be therapeuticAssociation, but the tag in backend is looking for 'therapeutic'
  therapeuticAssociation: 'Variants with Clinical Evidence for Treatment in This Tumour Type',
  cancerRelevance: 'Variants with Cancer Relevance',
  unknownSignificance: 'Variants of Uncertain Significance',
};

const SHOW_NATIVE_CONTEXT_TABLES = ['targetedSomaticGenes', 'targetedGermlineGenes'];

type KbMatchesDestinationTableType = keyof typeof KB_MATCHES_TITLE_MAP | keyof typeof RAPID_TABLE_TITLE_MAP | '';

const getKbDestinationTables = (currentTable) => Object.entries(KB_MATCHES_TITLE_MAP)
  .filter(([key]) => !['targetedSomaticGenes', currentTable].includes(key))
  .map(([key, value]) => ({
    label: value,
    value: key,
  }));

const getRapidSummaryDestinationTables = () => Object.entries(RAPID_TABLE_TITLE_MAP)
  .map(([key, value]) => ({
    label: value,
    value: key,
  }));

const getPayloadOptions = (
  destinationType: KbMatchesMoveDialogContextType['destinationType'],
  destinationTable: KbMatchesDestinationTableType,
) => {
  if (destinationType === 'kbMatches') {
    if (destinationTable === 'highEvidence') {
      return {
        category: 'therapeutic',
        kbData: { kbmatchTag: 'bestTherapeutic' },
      };
    }
    return {
      category: destinationTable,
      kbData: { kbmatchTag: destinationTable },
    };
  }
  return {};
};

const FILTER_DEBOUNCE_TIME = 500; // ms before input text for filter refreshes for tables

type AddObservedVariantAnnotationFnType = {
  reportId: ReportType['ident'];
  destTable: KbMatchesDestinationTableType;
  dataRows: KbMatchesMoveDialogContextType['selectedRows'];
};

type UpdateKbStatementsFnType = {
  idMap: Record<string, string>;
  reportId: ReportType['ident'];
  payloadOptions: ApiCallPayload;
  selectedStatementIds: KbMatchedStatementType['ident'][];
};

const updateKbStatementsFn = async ({
  idMap, reportId, selectedStatementIds, payloadOptions,
}: UpdateKbStatementsFnType) => {
  const requests = selectedStatementIds.map((id) => api.put(`/reports/${reportId}/kb-matches/kb-matched-statements/${idMap[id]}`, payloadOptions));
  const callSetResp = await new ApiCallSet(requests).request();
  return callSetResp;
};

type UpdateObservedVariantAnnotationFnType = {
  reportId: ReportType['ident'];
  observedVariantAnnotId: string;
  destinationTable: KbMatchesDestinationTableType;
};

const updateObservedVariantAnnotationFn = async (
  {
    reportId, observedVariantAnnotId, destinationTable,
  }: UpdateObservedVariantAnnotationFnType,
) => api.put(`/reports/${reportId}/observed-variant-annotations/${observedVariantAnnotId}`, {
  annotations: {
    rapidReportTableTag: destinationTable,
  },
}).request();

type KbMatchesMoveDialogType = {
  onClose: () => void;
  onConfirm: (updatedKbStatements: boolean) => void;
};

const KbMatchesMoveDialog = (props: KbMatchesMoveDialogType) => {
  const {
    onClose,
    onConfirm,
  } = props;
  const { report: { ident: reportIdent } } = useReport();
  const {
    moveKbMatchesTableName,
    moveKbMatchesDialogOpen,
    selectedRows,
    selectedKbIdToIprMapping,
    destinationType,
  } = useKbMatches();
  const [destinationTable, setDestinationTable] = useState<KbMatchesDestinationTableType>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedKbStatementIds, setSelectedKbStatementIds] = useState<string[]>(null);

  useEffect(() => {
    if (selectedRows) {
      setSelectedKbStatementIds(
        Array.from(new Set(selectedRows.flatMap(({ kbStatementId }) => kbStatementId))),
      );
    }
  }, [selectedRows]);

  const { mutate: updateKbStatements } = useMutation({
    mutationFn: updateKbStatementsFn,
    onSuccess: () => {
      snackbar.success('Moved Kb Statements (PUT), refetching ...');
      onConfirm(true);
    },
    onError: (e: ErrorMixin) => {
      snackbar.error(`Unable to move Kb statements, ${e.message ?? e}`);
    },
  });

  const { mutate: addObservedVariantAnnotation } = useMutation({
    mutationFn: async ({ reportId, destTable, dataRows }: AddObservedVariantAnnotationFnType) => {
      const extractedVariants = dataRows.flatMap((item) => item.kbMatches);
      const kbStatementIds = dataRows.flatMap((item) => item.ident);
      const seen = new Set();
      const uniqueVariants = extractedVariants.filter(({ variant: { ident } }) => {
        if (seen.has(ident)) return false;
        seen.add(ident);
        return true;
      });

      const results = await Promise.allSettled(
        uniqueVariants.map(async ({ variant: { ident: variantIdent }, variantType }) => {
          try {
            await api.post(`/reports/${reportId}/variants/set-summary-table`, {
              variantIdent,
              variantType,
              annotations: {
                rapidReportTableTag: destTable,
              },
              kbStatementIds,
            }).request();
          } catch (e) {
            if (e instanceof RecordConflictError && e.content.data) {
              // Fallback to PUT
              try {
                await updateObservedVariantAnnotationFn({
                  reportId,
                  observedVariantAnnotId: (e.content.data as { ident: string }).ident,
                  destinationTable: destTable,
                });
              } catch (putError) {
                snackbar.error(`Failed to update variant: ${variantType}: ${variantIdent}`);
                throw putError;
              }
            } else {
              throw e;
            }
          }
        }),
      );

      const rejected = results.filter((r) => r.status === 'rejected');
      if (rejected.length > 0) {
        throw new Error(`${rejected.length} variant(s) failed.`);
      }

      return results;
    },
    onSuccess: () => {
      snackbar.success('Moved Variants, refetching ...');
      onConfirm(true);
    },
    onError: (e: { message?: string }) => {
      snackbar.error(`Unable to move Kb statements, ${e.message ?? e}`);
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const handleOnSave = useCallback(() => {
    setIsUpdating(true);
    if (destinationType === 'rapidSummary') {
      addObservedVariantAnnotation({
        destTable: destinationTable,
        reportId: reportIdent,
        dataRows: selectedRows,
      });
    } else {
      updateKbStatements({
        idMap: selectedKbIdToIprMapping,
        payloadOptions: getPayloadOptions('kbMatches', destinationTable),
        reportId: reportIdent,
        selectedStatementIds: selectedKbStatementIds,
      });
    }
  }, [addObservedVariantAnnotation, destinationTable, destinationType, reportIdent, selectedKbIdToIprMapping, selectedKbStatementIds, selectedRows, updateKbStatements]);

  const handleDestinationChange = useCallback(({ target: { value } }) => {
    setDestinationTable(value as KbMatchesDestinationTableType);
  }, [setDestinationTable]);

  const handleOnClose = useCallback(() => {
    setDestinationTable('');
    onClose();
  }, [onClose]);

  const handleOnCheck = useCallback(({ target: { checked, value } }) => {
    setSelectedKbStatementIds((selected) => {
      const nextSelected = [...selected];
      if (checked) {
        nextSelected.push(value);
      } else {
        const idx = nextSelected.indexOf(value);
        nextSelected.splice(idx, 1);
      }
      return nextSelected;
    });
  }, []);

  return (
    <Dialog
      open={moveKbMatchesDialogOpen}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        Move Selected KbMatches to another Table
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Currently Selected KbMatches to be moved:
        </DialogContentText>
        <List>
          {
            selectedRows?.map((kbM: KbMatchedStatementType) => {
              let statementIds: string[];
              if (!Array.isArray(kbM.kbStatementId)) {
                statementIds = [kbM.kbStatementId];
              } else {
                statementIds = kbM.kbStatementId;
              }
              return (
                <ListItem key={statementIds.toString()} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <DialogContentText>
                    {getBucketKey(kbM).replace(/\|\|/g, ' ')}
                  </DialogContentText>
                  <List disablePadding>
                    {statementIds.map((id) => (
                      <ListItem key={id} sx={{ py: 0 }}>
                        <FormControlLabel
                          control={(
                            <Checkbox
                              value={id}
                              checked={selectedKbStatementIds?.includes(id)}
                              onChange={handleOnCheck}
                            />
                          )}
                          label={id}
                        />
                      </ListItem>
                    ))}
                  </List>
                </ListItem>
              );
            })
          }
        </List>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="destination-table-select-label">Destination Table</InputLabel>
          <Select
            required
            id="destination-table-select"
            labelId="destination-table-select-label"
            onChange={handleDestinationChange}
            label="Destination Table" // MUI requires both labelId and label to properly display
            value={destinationTable}
          >
            {
              destinationType === 'kbMatches'
              && getKbDestinationTables(moveKbMatchesTableName).map(({ label, value }) => (
                <MenuItem value={value} key={value}>{label}</MenuItem>
              ))
            }
            {
              destinationType === 'rapidSummary'
              && getRapidSummaryDestinationTables().map(({ label, value }) => (
                <MenuItem value={value} key={value}>{label}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnClose}>Cancel</Button>
        <Button
          disabled={isUpdating || !destinationTable || !selectedKbStatementIds}
          variant="contained"
          color="primary"
          onClick={handleOnSave}
        >
          Save
        </Button>
      </DialogActions>
      {isUpdating && <LinearProgress />}
    </Dialog>
  );
};

type KbMatchesProps = {
  /* Should the print version be displayed? */
  isPrint?: boolean;
} & WithLoadingInjectedProps;

const KbMatches = ({
  isPrint = false,
  setIsLoading,
  isLoading,
}: KbMatchesProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useReport();
  const { hash, pathname } = useLocation();

  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, FILTER_DEBOUNCE_TIME);
  const [groupedMatches, setGroupedMatches] = useState({
    therapeutic: [],
    biological: [],
    diagnostic: [],
    prognostic: [],
    unknown: [],
    highEvidence: [],
    targetedGermlineGenes: [],
    targetedSomaticGenes: [],
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  const [destinationType, setDestinationType] = useState<KbMatchesMoveDialogContextType['destinationType']>('kbMatches');
  const [moveKbMatchesDialogOpen, setMoveKbMatchesDialogOpen] = useState(false);
  const [moveKbMatchesTableName, setMoveKbMatchesTableName] = useState('');
  const [fetchData, setFetchData] = useState('initial');

  // TODO: find a better way
  const [allKbMatches, setAllKbMatches] = useState(null);

  // Initiate refs for each DataTable
  const kbMatchedTableRefs = useRef<Record<string, React.RefObject<DataTableImperativeHandle>>>({});
  useEffect(() => {
    Object.keys(KB_MATCHES_TITLE_MAP).forEach((key) => {
      if (!kbMatchedTableRefs.current[key]) {
        kbMatchedTableRefs.current[key] = createRef<DataTableImperativeHandle>();
      }
    });
  }, []);

  const templateName = report?.template.name;

  useEffect(() => {
    if (report && fetchData) {
      const getData = async () => {
        setIsLoading(true);
        try {
          const baseUri = `/reports/${report.ident}/kb-matches/kb-matched-statements`;
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/probe-results`, {}),
            api.get(`${baseUri}`, {}),
          ]);

          const [
            targetedSomaticGenesResp,
            allKbMatchesResp,
          ] = await apiCalls.request() as [
            ProbeResultsType[],
            KbMatchedStatementType[],
          ];

          setAllKbMatches(allKbMatchesResp);

          // TODO this is here for backwards compatibility; consider removing after datafix
          const oldStmts = allKbMatchesResp.filter((stmt) => !stmt.kbData?.kbmatchTag);
          const oldHighEvidence = oldStmts.filter((item) => item.category === 'therapeutic'
            && item.approvedTherapy
            && item.matchedCancer === true
            && ['IPR-A', 'IPR-B'].includes(item?.iprEvidenceLevel));

          // therapeutic but not best therapeutic. might be inconsistent with existing filtering -
          // currently items that are therapeutic and approved but not with high evidence level are just
          // not displayed (there may currently not be any such items). the difference will be
          // that some items that were not previously displayed at all might now be displayed
          // in this table
          const oldTherapeutic = oldStmts.filter((item) => item.category === 'therapeutic'
            && !oldHighEvidence.some((obj) => obj.ident === item.ident));

          // might be inconsistent with existing filtering - currently items that have
          // 'approvedTherapy' True but not category 'therapeutic' are not displayed.
          // (there are no examples in the db currently). here, we ignore approvedTherapy
          // except for therapeutic stmts, so it's possible for items that previously
          // would never be displayed, to be displayed here
          const oldBiological = oldStmts.filter((item) => item.category === 'biological');
          const oldDiagnostic = oldStmts.filter((item) => item.category === 'diagnostic');
          const oldPrognostic = oldStmts.filter((item) => item.category === 'prognostic');
          const oldPcp = oldStmts.filter((item) => ['cancer-predisposition', 'pharmacogenomic'].includes(item.category));

          const taggedKbMatches = allKbMatchesResp.filter((stmt) => stmt?.kbData?.kbmatchTag);

          const highEvidenceStmts = [...oldHighEvidence, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'bestTherapeutic')];
          const therapeuticStmts = [...oldTherapeutic, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'therapeutic')];
          const biologicalStmts = [...oldBiological, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'biological')];
          const diagnosticStmts = [...oldDiagnostic, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'diagnostic')];
          const prognosticStmts = [...oldPrognostic, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'prognostic')];
          const targetedGermlineGenesStmts = [...oldPcp, ...taggedKbMatches.filter((stmt) => stmt?.kbData?.kbmatchTag === 'pcp')];
          const highEvidence = coalesceEntries(highEvidenceStmts);
          const therapeutic = coalesceEntries(therapeuticStmts);
          const biological = coalesceEntries(biologicalStmts);
          const diagnostic = coalesceEntries(diagnosticStmts);
          const prognostic = coalesceEntries(prognosticStmts);
          const targetedGermlineGenes = coalesceEntries(targetedGermlineGenesStmts);
          const unknown = coalesceEntries(allKbMatchesResp.filter((stmt) => ![...highEvidenceStmts, ...therapeuticStmts, ...biologicalStmts, ...diagnosticStmts, ...prognosticStmts, ...targetedGermlineGenesStmts].some((obj) => obj.ident === stmt.ident)));

          setGroupedMatches({
            highEvidence,
            therapeutic,
            biological,
            diagnostic,
            prognostic,
            targetedGermlineGenes,
            unknown,
            targetedSomaticGenes: targetedSomaticGenesResp.filter((tg) => !/germline/.test(tg?.sample)),
          });

          if (fetchData === 'refetch') {
            snackbar.success('Successfully refetched KbMatches.');
          }
        } catch (err) {
          if (err.name === 'CoalesceEntriesError') {
            snackbar.error(err.message);
          } else {
            snackbar.error(`Network error: ${err}`);
          }
        } finally {
          setIsLoading(false);
          setFetchData('');
        }
      };

      getData();
    }
  }, [fetchData, report, setIsLoading]);

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => (
    setFilterText(event.target.value)
  );

  const handleDelete = useCallback(async (row) => {
    try {
      // More than one ident coalesced into one row
      if (Array.isArray(row.ident)) {
        const apiCalls = new ApiCallSet();
        row.ident.forEach((ident: string) => {
          apiCalls.push(api.del(`/reports/${report.ident}/kb-matches/kb-matched-statements/${ident}`, {}, {}));
        });
        await apiCalls.request();
      } else {
        await api.del(`/reports/${report.ident}/kb-matches/kb-matched-statements/${row.ident}`, {}, {}).request();
      }

      setGroupedMatches((oldMatches) => {
        const newMatches = { ...oldMatches };

        // Therapeutic matches can also be in this/otherCancer
        if (row.category === 'therapeutic') {
          ['therapeutic', 'highEvidence'].forEach((category) => {
            let dataSet = newMatches[category];
            dataSet = dataSet.filter((val) => val.ident !== row.ident);
            newMatches[category] = dataSet ?? [];
          });
        } else {
          let dataSet = newMatches[row.category];
          dataSet = dataSet.filter((val) => val.ident !== row.ident);
          newMatches[row.category] = dataSet ?? [];
        }
        return newMatches;
      });
      snackbar.success('Row deleted');
    } catch (err) {
      snackbar.error(`Deletion failed: ${err}`);
    }
  }, [report]);

  const onCellContextMenu = useCallback((tableName) => (params) => {
    const { event, node, api: gridApi } = params;
    event.preventDefault(); // Disable browser's context menu for cells
    setMenuAnchor({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
    setMoveKbMatchesTableName(tableName);
    const currentSelectedRows = gridApi.getSelectedRows();

    if (currentSelectedRows.length < 1) {
      setSelectedRows([node.data]); // Capture selected row data
    } else {
      setSelectedRows(currentSelectedRows);
    }
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleMoveToAnotherKbTable = useCallback(() => {
    setMoveKbMatchesDialogOpen(true);
    setDestinationType('kbMatches');
    handleMenuClose();
  }, [handleMenuClose]);

  const handleMoveToRapidSummary = useCallback(() => {
    setMoveKbMatchesDialogOpen(true);
    setDestinationType('rapidSummary');
    handleMenuClose();
  }, [handleMenuClose]);

  const handleGridContextMenu = useCallback((event) => {
    const section = event.target.closest('section[id]');

    // Disable right-click on empty grid areas (outside of cells)
    if (
      event.target.closest('.ag-root')
      && !SHOW_NATIVE_CONTEXT_TABLES.includes(section?.id)
    ) {
      event.preventDefault(); // Disable browser's context menu
    }
  }, []);

  const handleOnKbMatchesMoveConfirm = useCallback((updatedKbStatements) => {
    if (updatedKbStatements) {
      setFetchData('refetch');
    }
    setMoveKbMatchesDialogOpen(false);
  }, []);

  const additionalTableMenuItems = useCallback((tableName) => (gridApi: GridApi) => {
    const currentSelectedRows = gridApi?.getSelectedRows();
    const isRapid = templateName.toLowerCase() === 'rapid';
    const kbMatchesMoveOption = (
      <MenuItem
        key={tableName}
        onClick={() => {
          setSelectedRows(currentSelectedRows);
          setMoveKbMatchesTableName(tableName);
          setDestinationType('kbMatches');
          setMoveKbMatchesDialogOpen(true);
        }}
      >
        Move Selected KbMatches
      </MenuItem>
    );
    const rapidMoveOption = isRapid ? (
      <MenuItem
        key={`${tableName}-rapid`}
        onClick={() => {
          setSelectedRows(currentSelectedRows);
          setMoveKbMatchesTableName(tableName);
          setDestinationType('rapidSummary');
          setMoveKbMatchesDialogOpen(true);
        }}
      >
        Add Selected Variant(s) to Rapid Summary Table
      </MenuItem>
    ) : null;
    return ([kbMatchesMoveOption, rapidMoveOption]);
  }, [templateName]);

  const kbMatchedTables = useMemo(() => Object.keys(KB_MATCHES_TITLE_MAP).map((key) => {
    // Only when the table is probe or rapid, do not display targeted Somatic/Germline genes
    const shouldRenderTable = (
      templateName !== 'probe' && templateName !== 'rapid'
    ) || (key !== 'targetedSomaticGenes' && key !== 'targetedGermlineGenes');

    if (!shouldRenderTable) return null;

    const hideCustomContextMenu = SHOW_NATIVE_CONTEXT_TABLES.includes(key);

    return (
      <section onContextMenu={handleGridContextMenu} id={key} key={key}>
        <DataTable
          ref={kbMatchedTableRefs.current[key]}
          canDelete={canEdit}
          canToggleColumns
          columnDefs={(key === 'targetedSomaticGenes') ? targetedColumnDefs : columnDefs}
          filterText={debouncedFilterText}
          isPrint={isPrint}
          onDelete={handleDelete}
          rowData={groupedMatches[key]}
          titleText={KB_MATCHES_TITLE_MAP[key]}
          rowSelection="multiple"
          onCellContextMenu={!hideCustomContextMenu ? onCellContextMenu(key) : null}
          additionalTableMenuItems={additionalTableMenuItems(key)}
        />
      </section>
    );
  }), [additionalTableMenuItems, canEdit, debouncedFilterText, groupedMatches, handleDelete, handleGridContextMenu, isPrint, onCellContextMenu, templateName]);

  const moveKbMatchesContextValue = useMemo(() => {
    const kbMatchesToFind = Array.from(new Set(selectedRows?.map(({ kbStatementId }) => kbStatementId))).flat();
    let foundMapping: Record<string, string> | null = null;
    if (kbMatchesToFind) {
      foundMapping = {};
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < kbMatchesToFind.length; i++) {
        const found = allKbMatches?.find(({ kbStatementId }) => kbMatchesToFind[i] === kbStatementId);
        foundMapping[kbMatchesToFind[i] as string] = found.ident;
      }
    }

    return ({
      selectedKbIdToIprMapping: foundMapping,
      moveKbMatchesDialogOpen,
      setMoveKbMatchesDialogOpen,
      moveKbMatchesTableName,
      setMoveKbMatchesTableName,
      selectedRows,
      setSelectedRows,
      destinationType,
      setDestinationType,
    });
  }, [allKbMatches, destinationType, moveKbMatchesDialogOpen, moveKbMatchesTableName, selectedRows]);

  useEffect(() => {
    if (isLoading || !hash) return;

    const dehashed = hash.slice(1); // remove leading #
    const [tableId, id] = dehashed.split(':');

    let attempts = 0;
    const maxAttempts = 10;
    const retryDelay = 100; // ms

    // Polls for when gridApi ready
    const tryGoToEntry = () => {
      const targetTableRef = kbMatchedTableRefs.current[tableId]?.current;

      if (targetTableRef?.goToEntry) {
        targetTableRef.goToEntry(id);

        const el = document.getElementById(tableId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (attempts < maxAttempts) {
        attempts += 1;
        setTimeout(tryGoToEntry, retryDelay);
      } else {
        snackbar.warning(`goToEntry failed: ${tableId} ref not ready after ${maxAttempts} tries`);
      }
    };

    tryGoToEntry();
  }, [isLoading, hash]);

  const copyIdentToClipboard = useCallback(async () => {
    const { ident, category } = selectedRows[0] ?? [];

    if (!ident || !category) {
      snackbar.error('Unable to copy link due to either ident or category being null');
      return;
    }

    const fullLink = `${window.location.origin}${pathname}#${category}:${ident}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullLink);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullLink;
        textArea.style.position = 'fixed'; // prevent scroll jump
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) throw new Error('Fallback: Copy command failed');
      }
      snackbar.info(`Copied to clipboard: ${ident}`);
    } catch (err) {
      snackbar.error('Failed to copy to clipboard');
    }
  }, [selectedRows, pathname]);

  return (
    <KbMatchesMoveDialogContext.Provider value={moveKbMatchesContextValue}>
      {!isLoading && (
        <div>
          <DemoDescription>
            Tumour alterations with specific therapeutic, prognostic, diagnostic or biological
            associations are identified using the knowledgebase GraphKB, which integrates information
            from sources including cancer databases, drug databases, clinical tests, and the literature.
            Associations are listed by the level of evidence for the use of that drug in the context of
            the observed alteration, including those that are approved in this or other cancer types,
            and those that have early clinical or preclinical evidence.
          </DemoDescription>
          {!isPrint && (
            <div className="kb-matches__filter">
              <TextField
                label="Filter Table Text"
                type="text"
                variant="outlined"
                value={filterText}
                onChange={handleFilter}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <FilterList color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          )}
          <div>
            {kbMatchedTables}
            {menuAnchor && (
              <Menu
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  menuAnchor
                    ? { top: menuAnchor.mouseY, left: menuAnchor.mouseX }
                    : undefined
                }
              >
                <MenuItem onClick={handleMoveToAnotherKbTable}>Move to another KbMatches Table</MenuItem>
                <MenuItem
                  disabled={selectedRows?.length > 1}
                  onClick={copyIdentToClipboard}
                >
                  Copy Row Link
                </MenuItem>
                {
                  templateName === 'rapid'
                  && <MenuItem onClick={handleMoveToRapidSummary}>Add Variant to Rapid Summary Table</MenuItem>
                }
              </Menu>
            )}
            <KbMatchesMoveDialog
              onClose={() => {
                setMoveKbMatchesDialogOpen(false);
                setMoveKbMatchesTableName('');
              }}
              onConfirm={handleOnKbMatchesMoveConfirm}
            />
          </div>
        </div>
      )}
    </KbMatchesMoveDialogContext.Provider>
  );
};

export default withLoading(KbMatches);
