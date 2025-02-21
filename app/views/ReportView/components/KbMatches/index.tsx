import React, {
  useState, useEffect, useContext, useCallback, useMemo,
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
  SelectChangeEvent,
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

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import useReport from '@/hooks/useReport';
import DataTable from '@/components/DataTable';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import ReportContext from '@/context/ReportContext';
import { KbMatchedStatementType } from '@/common';
import { GridApi } from '@ag-grid-community/core';
import { KbMatchesMoveDialogContext, useKbMatches } from '@/context/KbMatchesMoveDialogContext/KbmatchesMoveDialogContext';
import { columnDefs, targetedColumnDefs } from './columnDefs';
import { coalesceEntries, getBucketKey } from './coalesce';

import './index.scss';
import ProbeResultsType from '../ProbeSummary/types';

const TITLE_MAP = {
  highEvidence: 'Therapeutic Alterations with High-Level Clinical Evidence in this Tumour Type',
  therapeutic: 'Therapeutic Alterations',
  diagnostic: 'Diagnostic Alterations',
  prognostic: 'Prognostic Alterations',
  biological: 'Biological Alterations',
  unknown: 'Other Alterations',
  targetedGermlineGenes: 'Detected Alterations from Pharmacogenomic and Cancer Predisposition Targeted Gene Report',
  targetedSomaticGenes: 'Detected Alterations From Somatic Targeted Gene Report',
};

const getDestinationTables = (currentTable) => Object.entries(TITLE_MAP)
  .filter(([key]) => !['targetedSomaticGenes', currentTable].includes(key))
  .map(([key, value]) => ({
    label: value,
    value: key,
  }));

const FILTER_DEBOUNCE_TIME = 500; // ms before input text for filter refreshes for tables

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
  } = useKbMatches();
  const [destinationTable, setDestinationTable] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedKbStatementIds, setSelectedKbStatementIds] = useState<string[]>(null);

  useEffect(() => {
    if (selectedRows) {
      setSelectedKbStatementIds(
        Array.from(new Set(selectedRows.flatMap(({ kbStatementId }) => kbStatementId))),
      );
    }
  }, [selectedRows]);

  const handleOnSave = useCallback(() => {
    setIsUpdating(true);
    const moveKbMatches = async () => {
      try {
        // Check if the table is highEvidence or not
        const payloadOptions = destinationTable === 'highEvidence'
          ? {
            category: 'therapeutic',
            kbData: { kbmatchTag: 'bestTherapeutic' },
          }
          : {
            category: destinationTable,
            kbData: { kbmatchTag: destinationTable },
          };

        // Check if a row is coalesced by checking if the ident property of the statement is an array or not. If it is an array, deconstruct and call the api with each ident
        const kbStatementCalls = selectedKbStatementIds
          .map((id) => api.put(`/reports/${reportIdent}/kb-matches/kb-matched-statements/${selectedKbIdToIprMapping[id]}`, payloadOptions));
        const apiCalls = new ApiCallSet(kbStatementCalls);
        await apiCalls.request();
        snackbar.success('Moved Kb Statements, refetching ...');
        onConfirm(true);
      } catch (e) {
        snackbar.error(`Unable to move Kb statements, ${e.message ?? e}`);
      } finally {
        setIsUpdating(false);
      }
    };
    moveKbMatches();
  }, [destinationTable, onConfirm, reportIdent, selectedKbIdToIprMapping, selectedKbStatementIds]);

  const handleDestinationChange = useCallback(({ target: { value } }: SelectChangeEvent<string>) => {
    setDestinationTable(value);
  }, [setDestinationTable]);

  const handleOnClose = useCallback((_evt, reason) => {
    if (reason === 'backdropClick') {
      onClose();
    }
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
      onClose={handleOnClose}
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
                <ListItem key={statementIds.toString()}>
                  <DialogContentText>
                    {getBucketKey(kbM).replace(/\|\|/g, ' ')}
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
                  </DialogContentText>
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
          >
            {
              getDestinationTables(moveKbMatchesTableName).map(({ label, value }) => (
                <MenuItem value={value} key={value}>{label}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={isUpdating || !destinationTable || !selectedKbStatementIds}
          variant="contained"
          color="primary"
          onClick={handleOnSave}
        >
          Save
        </Button>
      </DialogActions>
      { isUpdating && <LinearProgress />}
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
  const [moveKbMatchesDialogOpen, setMoveKbMatchesDialogOpen] = useState(false);
  const [moveKbMatchesTableName, setMoveKbMatchesTableName] = useState('');
  const [fetchData, setFetchData] = useState('initial');

  // TODO: find a better way
  const [allKbMatches, setAllKbMatches] = useState(null);

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

  const handleMoveToAnotherTable = useCallback(() => {
    setMoveKbMatchesDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleGridContextMenu = useCallback((event) => {
    // Disable right-click on empty grid areas (outside of cells)
    if (event.target.closest('.ag-root')) {
      event.preventDefault(); // Disable browser's context menu
    }
  }, []);

  const handleOnKbMatchesMoveConfirm = useCallback((updatedKbStatements) => {
    if (updatedKbStatements) {
      setFetchData('refetch');
    }
    setMoveKbMatchesDialogOpen(false);
  }, []);

  const kbMatchedTables = useMemo(() => Object.keys(TITLE_MAP).map((key) => {
    const additionalTableMenuItems = (gridApi: GridApi) => {
      const currentSelectedRows = gridApi?.getSelectedRows();
      return (
        <MenuItem
          key={key}
          onClick={() => {
            setSelectedRows(currentSelectedRows);
            setMoveKbMatchesTableName(key);
            setMoveKbMatchesDialogOpen(true);
          }}
        >
          Move Selected KbMatches
        </MenuItem>
      );
    };
    return (
      <div onContextMenu={handleGridContextMenu} key={key}>
        {
          (
            (report?.template.name !== 'probe' && report?.template.name !== 'rapid')
            || (key !== 'targetedSomaticGenes' && key !== 'targetedGermlineGenes')
          ) && (
            <DataTable
              canDelete={canEdit}
              canToggleColumns
              columnDefs={(key === 'targetedSomaticGenes') ? targetedColumnDefs : columnDefs}
              filterText={debouncedFilterText}
              isPrint={isPrint}
              onDelete={handleDelete}
              rowData={groupedMatches[key]}
              titleText={TITLE_MAP[key]}
              rowSelection="multiple"
              onCellContextMenu={onCellContextMenu(key)}
              additionalTableMenuItems={additionalTableMenuItems}
            />
          )
        }
      </div>
    );
  }), [
    canEdit,
    debouncedFilterText,
    groupedMatches,
    handleDelete,
    handleGridContextMenu,
    isPrint,
    onCellContextMenu,
    report?.template.name,
  ]);

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
    });
  }, [allKbMatches, moveKbMatchesDialogOpen, moveKbMatchesTableName, selectedRows]);

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
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              anchorReference="anchorPosition"
              anchorPosition={
                menuAnchor
                  ? { top: menuAnchor.mouseY, left: menuAnchor.mouseX }
                  : undefined
              }
            >
              <MenuItem onClick={handleMoveToAnotherTable}>Move to another table</MenuItem>
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
