import React, {
  useRef, useState, useEffect, useCallback, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from '@ag-grid-community/react';
import { SnackbarContext } from '@bcgsc/react-snackbar-provider';
import {
  Typography,
  IconButton,
  Dialog,
  Switch,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import GetAppIcon from '@material-ui/icons/GetApp';
import ColumnPicker from './components/ColumnPicker';
import LinkCellRenderer from './components/LinkCellRenderer';
import GeneCellRenderer from './components/GeneCellRenderer';
import ActionCellRenderer from './components/ActionCellRenderer';
import { getDate } from '../../utils/date';
import ConfirmContext from '@/components/ConfirmContext';

import './index.scss';

const MAX_VISIBLE_ROWS = 12;
const MAX_TABLE_HEIGHT = '517px';

/**
 * @param {object} props props
 * @param {array} props.rowData table row data
 * @param {array} props.columnDefs column definitions for ag-grid
 * @param {string} props.titleText table title
 * @param {string} props.filterText text to filter the table on
 * @param {bool} props.canEdit can rows be edited?
 * @param {object} props.EditDialog Edit Dialog component
 * @param {string} props.reportIdent Ident of report (used for editing api calls)
 * @param {string} props.tableType type of table used for therapeutic targets
 * @param {array} props.visibleColumns array of column ids that are visible
 * @param {func} props.syncVisibleColumns function to propagate visible column changes
 * @param {bool} props.canToggleColumns can visible/hidden columns be toggled
 * @param {bool} props.canViewDetails can the detail dialog be shown
 * @param {bool} props.isPaginated should the table be paginated
 * @param {bool} props.canReorder can the rows be reordered
 * @param {func} props.rowUpdateAPICall API call for reordering rows
 * @param {bool} props.canExport can table data be exported to csv
 * @param {string} props.patientId patient identifer as readable string
 * @param {object} props.theme MUI theme passed for react in angular table compatibility
 * @return {*} JSX
 */
function DataTable(props) {
  const {
    rowData,
    onRowDataChanged,
    columnDefs,
    titleText,
    filterText,
    canEdit,
    onEdit,
    canDelete,
    onDelete,
    canAdd,
    onAdd,
    addText,
    reportIdent,
    tableType,
    visibleColumns,
    syncVisibleColumns,
    canToggleColumns,
    canViewDetails,
    isPaginated,
    isFullLength,
    canReorder,
    rowUpdateAPICall,
    canExport,
    patientId,
    theme,
    isPrint,
    highlightRow,
    Header,
  } = props;

  const domLayout = isPrint ? 'print' : 'autoHeight';

  const gridApi = useRef();
  const columnApi = useRef();
  const ColumnPickerOnClose = useRef();
  const gridDiv = useRef();
  const gridRef = useRef();

  const setColumnPickerOnClose = (ref) => {
    ColumnPickerOnClose.current = ref;
  };

  const snackbar = useContext(SnackbarContext);
  const { isSigned } = useContext(ConfirmContext);

  const [showPopover, setShowPopover] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [showReorder, setShowReorder] = useState(false);
  const [tableLength, setTableLength] = useState(rowData.length);

  useEffect(() => {
    if (gridApi.current) {
      gridApi.current.setQuickFilter(filterText);
    }
  }, [filterText]);

  // Triggers when syncVisibleColumns is called
  useEffect(() => {
    if (columnApi.current && visibleColumns.length) {
      const allCols = columnApi.current.getAllColumns().map(col => col.colId);
      const hiddenColumns = allCols.filter(col => !visibleColumns.includes(col));
      columnApi.current.setColumnsVisible(visibleColumns, true);
      columnApi.current.setColumnsVisible(hiddenColumns, false);
    }
  }, [visibleColumns]);

  useEffect(() => {
    if (gridApi.current) {
      if (highlightRow !== null) {
        const rowNode = gridApi.current.getDisplayedRowAtIndex(highlightRow);
        rowNode.setSelected(true, true);
        gridApi.current.ensureIndexVisible(highlightRow, 'middle');

        const [element] = document.querySelectorAll(`div[class="report__content"]`);
        element.scrollTo({
          top: gridRef.current.eGridDiv.offsetTop,
          left: 0,
          behavior: 'smooth',
        });
      } else {
        const selected = gridApi.current.getSelectedNodes();
        if (selected && selected.length) {
          selected.forEach(node => node.setSelected(false));
        }
      }
    }
  }, [highlightRow]);

  const getColumnVisibility = () => {
    const visibleColumnIds = columnApi.current.getAllDisplayedColumns()
      .map(col => col.colId);

    const hiddenColumnIds = columnApi.current.getAllColumns()
      .filter(col => !col.visible)
      .map(col => col.colId);

    return {
      visibleColumnIds,
      hiddenColumnIds,
    };
  };

  const onGridReady = (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    if (syncVisibleColumns) {
      const hiddenColumns = columnApi.current.getAllColumns()
        .map(col => col.colId)
        .filter(col => !visibleColumns.includes(col));

      columnApi.current.setColumnsVisible(visibleColumns, true);
      columnApi.current.setColumnsVisible(hiddenColumns, false);
    }

    if (rowData.length >= MAX_VISIBLE_ROWS && !isPrint && !isFullLength) {
      gridDiv.current.style.height = MAX_TABLE_HEIGHT;
      gridApi.current.setDomLayout('normal');
    }

    if (isFullLength) {
      gridDiv.current.style.height = '100%';
      gridDiv.current.style.flex = '1';
      gridApi.current.setDomLayout('normal');
    }

    if (isPrint) {
      const newCols = columnDefs.map(col => ({
        ...col,
        wrapText: true,
        autoHeight: true,
        cellClass: ['cell-wrap-text', 'cell-line-height'],
        cellStyle: { 'white-space': 'normal' },
      }));
      gridApi.current.setColumnDefs(newCols);
      columnApi.current.setColumnVisible('Actions', false);
      gridApi.current.sizeColumnsToFit();
    }
  };

  const onFirstDataRendered = () => {
    if (columnApi.current && !isFullLength) {
      const visibleColumnIds = columnApi.current.getAllColumns()
        .filter(col => !col.flex && col.visible)
        .map(col => col.colId);
      columnApi.current.autoSizeColumns(visibleColumnIds);
    } if (isFullLength) {
      gridApi.current.sizeColumnsToFit();
    }
  };

  const toggleReorder = () => {
    if (!showReorder) {
      columnDefs.forEach((col) => {
        col.sortable = false;
        col.filter = false;
      });
      gridApi.current.setSortModel([{ colId: 'rank', sort: 'asc' }]);
      gridApi.current.setColumnDefs(columnDefs);

      columnApi.current.setColumnVisible('drag', true);
      setShowReorder(true);
    } else {
      columnDefs.forEach((col) => {
        col.sortable = true;
        col.filter = true;
      });
      gridApi.current.setColumnDefs(columnDefs);

      columnApi.current.setColumnVisible('drag', false);
      setShowReorder(false);
    }
  };

  const onRowDragEnd = async (event) => {
    try {
      snackbar.clear();
      const oldRank = event.node.data.rank;
      const newRank = event.overIndex;

      const newData = [];
      gridApi.current.forEachNode(({ data: row }) => {
        if (row.rank === oldRank) {
          row.rank = newRank;
          return newData.push(row);
        }

        if (row.rank > oldRank && row.rank <= newRank) {
          row.rank -= 1;
        } else if (row.rank < oldRank && row.rank >= newRank) {
          row.rank += 1;
        }
        return newData.push(row);
      });
      newData.rank = event.overIndex;
      const call = rowUpdateAPICall(reportIdent, newData);
      const updatedRows = await call.request();

      if (updatedRows) {
        gridApi.current.updateRowData({ update: updatedRows });
        snackbar.add('Row update success');
      }
    } catch (err) {
      console.error(err);
      snackbar.add(`Rows were not updated: ${err}`);
    }
  };

  // const handleRowEditClose = useCallback((editedData) => {
  //   setShowEditDialog(false);
  //   if (editedData && selectedRow.node) {
  //     console.log(editedData);
  //     selectedRow.node.setData(editedData);
  //     gridApi.current.updateRowData({ update: [editedData] });
  //     console.log(selectedRow.node);
  //   } else if (editedData) {
  //     editedData.rank = tableLength;
  //     gridApi.current.updateRowData({ add: [editedData] });
  //     setTableLength(gridApi.current.getDisplayedRowCount());

  //     const { visibleColumnIds } = getColumnVisibility();
  //     columnApi.current.autoSizeColumns(visibleColumnIds);
  //   } else if (editedData === null) {
  //     // sending back null indicates the row was deleted
  //     gridApi.current.updateRowData({ remove: [selectedRow.node.data] });
  //     setTableLength(gridApi.current.getDisplayedRowCount());
  //   }
  //   setSelectedRow({});
  // }, [selectedRow.node, tableLength]);

  const defaultColDef = {
    sortable: !showReorder,
    resizable: true,
    filter: !showReorder,
    editable: false,
    valueFormatter: params => (params.value === null ? '' : params.value),
  };
    
  const renderColumnPicker = () => {
    const popoverCloseHandler = () => {
      const {
        visibleCols: returnedVisibleCols,
      } = ColumnPickerOnClose.current();
      returnedVisibleCols.push('Actions');
      const returnedHiddenCols = columnApi.current.getAllColumns()
        .map(col => col.colId)
        .filter(col => !returnedVisibleCols.includes(col));

      columnApi.current.setColumnsVisible(returnedVisibleCols, true);
      columnApi.current.setColumnsVisible(returnedHiddenCols, false);

      columnApi.current.autoSizeColumns(returnedVisibleCols);
      
      if (syncVisibleColumns) {
        syncVisibleColumns(returnedVisibleCols);
      }
      setShowPopover(prevVal => !prevVal);
    };

    const result = (
      <Dialog
        onClose={() => popoverCloseHandler()}
        open
      >
        <ColumnPicker
          className="data-view__options-menu"
          label="Configure Visible Columns"
          columns={columnApi.current.getAllColumns()
            .filter(col => col.colId !== 'Actions')
            .map((col) => {
              const parent = col.getOriginalParent();
              if (parent && parent.colGroupDef.headerName) {
                const parentName = parent.colGroupDef.headerName;
                col.name = `${parentName} ${columnApi.current.getDisplayNameForColumn(col)}`;
              } else {
                col.name = columnApi.current.getDisplayNameForColumn(col);
              }
              return col;
            })
          }
          onClose={setColumnPickerOnClose}
        />
      </Dialog>
    );
    return result;
  };

  const RowActionCellRenderer = useCallback(row => (
    <ActionCellRenderer
      onEdit={onEdit}
      onDelete={onDelete}
      {...row}
    />
  ), [onDelete, onEdit]);

  const handleCSVExport = () => {
    const date = getDate();

    gridApi.current.exportDataAsCsv({
      suppressQuotes: true,
      columnSeparator: '\t',
      columnKeys: columnApi.current.getAllDisplayedColumns()
        .map(col => col.colId)
        .filter(col => col === 'Actions'),
      fileName: `ipr_${patientId}_${reportIdent}_${titleText.split(' ').join('_')}_${date}.tsv`,
    });
  };

  const handleFilterAndSortChanged = useCallback(() => {
    const newRows = [];
    gridApi.current.forEachNodeAfterFilterAndSort(node => {
      newRows.push(node.data);
    });
    onRowDataChanged(newRows);
  }, [onRowDataChanged]);

  // Theme is needed for react in angular tables. It can't access the theme provider otherwise
  return (
    <ThemeProvider theme={theme}>
      <div className="data-table--padded" style={{ height: '100%' }}>
        {Boolean(rowData.length) || canEdit ? (
          <>
            {titleText && (
              <div className="data-table__header-container">
                <Typography variant="h3" className="data-table__header">
                  {titleText}
                </Typography>
                <div>
                  {canAdd && !isPrint && (
                    <span className="data-table__action">
                      <Typography display="inline">
                        {addText || 'Add row'}
                      </Typography>
                      <IconButton
                        onClick={() => onAdd(tableType ? { type: tableType } : null)}
                        title="Add Row"
                        className="data-table__icon-button"
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </span>
                  )}
                  {canToggleColumns && !isPrint && (
                    <span className="data-table__action">
                      <IconButton
                        onClick={() => setShowPopover(prevVal => !prevVal)}
                        className="data-table__icon-button"
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </span>
                  )}
                  {canExport && !isPrint && (
                    <span className="data-table__action">
                      <Typography display="inline">
                        Export to TSV
                      </Typography>
                      <IconButton
                        onClick={handleCSVExport}
                        title="Export to CSV"
                        className="data-table__icon-button"
                      >
                        <GetAppIcon />
                      </IconButton>
                    </span>
                  )}
                  {canReorder && !isPrint && (
                    <span className="data-table__action">
                      <Typography display="inline">
                        Reorder Rows
                      </Typography>
                      <Switch
                        checked={showReorder}
                        onChange={toggleReorder}
                        color="primary"
                        title="Reorder Rows"
                      />
                    </span>
                  )}
                </div>
              </div>
            )}
            <div
              className="ag-theme-material data-table__container"
              ref={gridDiv}
            >
              {showPopover
                && renderColumnPicker()
              }
              <AgGridReact
                ref={gridRef}
                columnDefs={columnDefs}
                rowData={rowData}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                domLayout={domLayout}
                pagination={isPaginated}
                paginationAutoPageSize={isFullLength}
                paginationPageSize={MAX_VISIBLE_ROWS}
                autoSizePadding="0"
                deltaRowDataMode={canReorder}
                getRowNodeId={data => data.ident}
                onRowDragEnd={canReorder ? onRowDragEnd : null}
                editType="fullRow"
                onFilterChanged={handleFilterAndSortChanged}
                onSortChanged={handleFilterAndSortChanged}
                context={{
                  canEdit,
                  canDelete,
                  canViewDetails,
                  reportIdent,
                  tableType,
                }}
                frameworkComponents={{
                  LinkCellRenderer,
                  GeneCellRenderer,
                  ActionCellRenderer: RowActionCellRenderer,
                  headerCellRenderer: Header,
                }}
                suppressAnimationFrame
                suppressColumnVirtualisation
                disableStaticMarkup // See https://github.com/ag-grid/ag-grid/issues/3727
                onFirstDataRendered={onFirstDataRendered}
              />
            </div>
          </>
        ) : (
          <>
            <div className="data-table__header-container">
              <Typography variant="h3" className="data-table__header">
                {titleText}
              </Typography>
            </div>
            <div className="data-table__container">
              <Typography variant="body1" align="center">
                No data to display
              </Typography>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

DataTable.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowData: PropTypes.arrayOf(PropTypes.object),
  titleText: PropTypes.string,
  filterText: PropTypes.string,
  canEdit: PropTypes.bool,
  EditDialog: PropTypes.func,
  canAdd: PropTypes.bool,
  reportIdent: PropTypes.string.isRequired,
  tableType: PropTypes.string,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  syncVisibleColumns: PropTypes.func,
  canToggleColumns: PropTypes.bool,
  canViewDetails: PropTypes.bool,
  isPaginated: PropTypes.bool,
  canReorder: PropTypes.bool,
  rowUpdateAPICall: PropTypes.func,
  canExport: PropTypes.bool,
  patientId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  theme: PropTypes.object,
  isPrint: PropTypes.bool,
  highlightRow: PropTypes.number || PropTypes.object,
  onRowDataChanged: PropTypes.func,
};

DataTable.defaultProps = {
  rowData: [],
  filterText: '',
  titleText: '',
  canEdit: false,
  EditDialog: () => null,
  canAdd: false,
  tableType: '',
  visibleColumns: [],
  syncVisibleColumns: null,
  canToggleColumns: false,
  canViewDetails: true,
  isPaginated: true,
  canReorder: false,
  rowUpdateAPICall: () => {},
  canExport: false,
  patientId: '',
  theme: {},
  isPrint: false,
  highlightRow: null,
  onRowDataChanged: () => {},
};

export default DataTable;
