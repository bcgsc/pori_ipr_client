import React, {
  useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  Typography,
  IconButton,
  Dialog,
} from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import OptionsMenu from '../OptionsMenu';
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
 * @param {string} props.reportId Ident of report (used for editing api calls)
 * @param {string} props.tableType type of table used for therapeutic targets
 * @param {array} props.visibleColumns array of column ids that are visible
 * @param {func} props.syncVisibleColumns function to propagate visible column changes
 * @param {bool} props.canToggleColumns can visible/hidden columns be toggled
 * @param {bool} props.canViewDetails can the detail dialog be shown
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
    reportId,
    tableType,
    visibleColumns,
    syncVisibleColumns,
    canToggleColumns,
    canViewDetails,
  } = props;

  const domLayout = 'autoHeight';

  const gridApi = useRef();
  const columnApi = useRef();
  const optionsMenuOnClose = useRef();
  const gridDiv = useRef();

  const setOptionsMenuOnClose = (ref) => {
    optionsMenuOnClose.current = ref;
  };

  const [showPopover, setShowPopover] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});

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
    sortable: true,
    resizable: true,
    filter: true,
    editable: false,
  };
    
  const renderOptionsMenu = () => {
    const popoverCloseHandler = () => {
      const {
        visibleCols: returnedVisibleCols,
        hiddenCols: returnedHiddenCols,
      } = optionsMenuOnClose.current();

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
        <OptionsMenu
          className="data-view__options-menu"
          label="Configure Visible Columns"
          columns={columnApi.current.getAllColumns()
            .map(col => ({ col, name: columnApi.current.getDisplayNameForColumn(col) }))
          }
          onClose={setOptionsMenuOnClose}
        />
      </Dialog>
    );
    return result;
  };

  const renderAddRow = () => (
    <IconButton
      onClick={() => setShowEditDialog(true)}
    >
      <AddCircleOutlineIcon />
    </IconButton>
  );

  return (
    <div className="data-table--padded">
      {rowData.length ? (
        <>
          <div className="data-table__header-container">
            <Typography variant="h5" className="data-table__header">
              {titleText}
            </Typography>
            {addable && renderAddRow()}
            <EditDialog
              open={showEditDialog}
              close={handleRowEditClose}
              editData={selectedRow.data}
              reportId={reportId}
              tableType={tableType}
            />
            {canToggleColumns && (
              <IconButton
                onClick={() => setShowPopover(prevVal => !prevVal)}
              >
                <MoreHorizIcon />
              </IconButton>
            )}
          </div>
          <div
            className="ag-theme-material data-table__container"
            ref={gridDiv}
          >
            {showPopover
              && renderOptionsMenu()
            }
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              domLayout={domLayout}
              pagination
              autoSizePadding="0"
              editType="fullRow"
              context={{
                editable,
                canViewDetails,
                EditDialog,
                reportId,
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
  reportId: PropTypes.string.isRequired,
  tableType: PropTypes.string,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  syncVisibleColumns: PropTypes.func,
  canToggleColumns: PropTypes.bool,
  canViewDetails: PropTypes.bool,
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
};

export default DataTable;
