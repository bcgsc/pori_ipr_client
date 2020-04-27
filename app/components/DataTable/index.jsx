import React, {
  useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from '@ag-grid-community/react';
import {
  Typography,
  IconButton,
  Dialog,
  Switch,
  Snackbar,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ColumnPicker from './components/ColumnPicker';
import LinkCellRenderer from './components/LinkCellRenderer';
import GeneCellRenderer from './components/GeneCellRenderer';
import ActionCellRenderer from './components/ActionCellRenderer';

import './index.scss';

const MAX_VISIBLE_ROWS = 12;
const MAX_TABLE_HEIGHT = '500px';

/**
 * @param {object} props props
 * @param {array} props.rowData table row data
 * @param {array} props.columnDefs column definitions for ag-grid
 * @param {string} props.titleText table title
 * @param {string} props.filterText text to filter the table on
 * @param {bool} props.editable can rows be edited?
 * @param {object} props.EditDialog Edit Dialog component
 * @param {string} props.reportIdent Ident of report (used for editing api calls)
 * @param {string} props.tableType type of table used for therapeutic targets
 * @param {array} props.visibleColumns array of column ids that are visible
 * @param {func} props.syncVisibleColumns function to propagate visible column changes
 * @param {bool} props.canToggleColumns can visible/hidden columns be toggled
 * @param {bool} props.canViewDetails can the detail dialog be shown
 * @param {bool} props.paginated should the table be paginated
 * @param {bool} props.canReorder can the rows be reordered
 * @param {func} props.rowUpdateAPICall API call for reordering rows
 * @return {*} JSX
 */
function DataTable(props) {
  const {
    rowData,
    columnDefs,
    titleText,
    filterText,
    editable,
    EditDialog,
    addable,
    reportIdent,
    tableType,
    visibleColumns,
    syncVisibleColumns,
    canToggleColumns,
    canViewDetails,
    paginated,
    canReorder,
    rowUpdateAPICall,
  } = props;

  const domLayout = 'autoHeight';

  const gridApi = useRef();
  const columnApi = useRef();
  const ColumnPickerOnClose = useRef();
  const gridDiv = useRef();

  const setColumnPickerOnClose = (ref) => {
    ColumnPickerOnClose.current = ref;
  };

  const [showPopover, setShowPopover] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [showReorder, setShowReorder] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarDuration, setSnackbarDuration] = useState(2000);

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

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowSnackbar(false);
  };

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

    if (rowData.length >= MAX_VISIBLE_ROWS) {
      gridDiv.current.style.height = MAX_TABLE_HEIGHT;
      gridApi.current.setDomLayout('normal');
    }

    const { visibleColumnIds } = getColumnVisibility();
    columnApi.current.autoSizeColumns(visibleColumnIds);
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
      const oldRank = event.node.data.rank;
      const newRank = event.overIndex;

      const newData = rowData.map((row) => {
        if (row.rank === oldRank) {
          row.rank = newRank;
          return row;
        }

        if (row.rank > oldRank && row.rank <= newRank) {
          row.rank -= 1;
        } else if (row.rank < oldRank && row.rank > newRank) {
          row.rank += 1;
        }
        return row;
      });
      newData.rank = event.overIndex;
      const updatedRows = await rowUpdateAPICall(
        reportIdent,
        newData,
      );

      gridApi.current.updateRowData({ update: updatedRows });
      setSnackbarDuration(2000);
      setShowSnackbar(true);
      setSnackbarMessage('Row update success');
    } catch (err) {
      setSnackbarDuration(5000);
      setShowSnackbar(true);
      setSnackbarMessage(`Rows were not updated: ${err}`);
    }
  };

  const handleRowEditClose = (editedData) => {
    setShowEditDialog(false);
    if (editedData && selectedRow.node) {
      selectedRow.node.setData(editedData);
    } else if (editedData) {
      gridApi.current.updateRowData({ add: [editedData] });
    }
    setSelectedRow({});
  };

  const defaultColDef = {
    sortable: !showReorder,
    resizable: true,
    filter: !showReorder,
    editable: false,
  };
    
  const renderColumnPicker = () => {
    const popoverCloseHandler = () => {
      const {
        visibleCols: returnedVisibleCols,
      } = ColumnPickerOnClose.current();
      returnedVisibleCols.push('Actions');

      columnApi.current.setColumnsVisible(returnedVisibleCols, true);

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
              col.name = columnApi.current.getDisplayNameForColumn(col);
              return col;
            })
          }
          onClose={setColumnPickerOnClose}
        />
      </Dialog>
    );
    return result;
  };

  return (
    <div className="data-table--padded">
      {rowData.length || editable ? (
        <>
          <div className="data-table__header-container">
            <Typography variant="h5" className="data-table__header">
              {titleText}
            </Typography>
            <div>
              {addable && (
                <>
                  <Typography display="inline">
                    Add Row
                  </Typography>
                  <IconButton
                    onClick={() => setShowEditDialog(true)}
                    title="Add Row"
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </>
              )}
              {canToggleColumns && (
                <IconButton
                  onClick={() => setShowPopover(prevVal => !prevVal)}
                >
                  <MoreHorizIcon />
                </IconButton>
              )}
              {canReorder && (
                <>
                  <Typography display="inline">
                    Toggle Reordering
                  </Typography>
                  <Switch
                    checked={showReorder}
                    onChange={toggleReorder}
                    color="primary"
                    title="Toggle Reordering"
                  />
                  <Snackbar
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    open={showSnackbar}
                    autoHideDuration={snackbarDuration}
                    message={snackbarMessage}
                    onClose={handleSnackbarClose}
                  />
                </>
              )}
            </div>
            <EditDialog
              open={showEditDialog}
              close={handleRowEditClose}
              editData={selectedRow.data}
              reportIdent={reportIdent}
              tableType={tableType}
            />
          </div>
          <div
            className="ag-theme-material data-table__container"
            ref={gridDiv}
          >
            {showPopover
              && renderColumnPicker()
            }
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              domLayout={domLayout}
              pagination={paginated}
              autoSizePadding="0"
              deltaRowDataMode={canReorder}
              onRowDragEnd={canReorder ? onRowDragEnd : null}
              editType="fullRow"
              context={{
                editable,
                canViewDetails,
                EditDialog,
                reportIdent,
                tableType,
              }}
              frameworkComponents={{
                EditDialog,
                LinkCellRenderer,
                GeneCellRenderer,
                ActionCellRenderer,
              }}
              suppressAnimationFrame
              suppressColumnVirtualisation
              disableStaticMarkup // See https://github.com/ag-grid/ag-grid/issues/3727
            />
          </div>
        </>
      ) : (
        <>
          <div className="data-table__header-container">
            <Typography variant="h5" className="data-table__header">
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
  );
}

DataTable.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowData: PropTypes.arrayOf(PropTypes.object),
  titleText: PropTypes.string,
  filterText: PropTypes.string,
  editable: PropTypes.bool,
  EditDialog: PropTypes.func,
  addable: PropTypes.bool,
  reportIdent: PropTypes.string.isRequired,
  tableType: PropTypes.string,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  syncVisibleColumns: PropTypes.func,
  canToggleColumns: PropTypes.bool,
  canViewDetails: PropTypes.bool,
  paginated: PropTypes.bool,
  canReorder: PropTypes.bool,
  rowUpdateAPICall: PropTypes.func,
};

DataTable.defaultProps = {
  rowData: [],
  filterText: '',
  titleText: '',
  editable: false,
  EditDialog: () => null,
  addable: false,
  tableType: '',
  visibleColumns: [],
  syncVisibleColumns: null,
  canToggleColumns: false,
  canViewDetails: true,
  paginated: true,
  canReorder: false,
  rowUpdateAPICall: () => {},
};

export default DataTable;
