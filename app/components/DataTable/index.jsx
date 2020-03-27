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
import DetailDialog from '../DetailDialog';

import './index.scss';


/**
 * @param {object} props props
 * @param {array} props.rowData table row data
 * @param {array} props.columnDefs column definitions for ag-grid
 * @param {array} props.arrayColumns list of columns containing array data
 * @param {string} props.titleText table title
 * @param {string} props.filterText text to filter the table on
 * @param {bool} props.editable can rows be edited?
 * @param {object} props.EditDialog Edit Dialog component
 * @param {string} props.reportIdent Ident of report (used for editing api calls)
 * @param {string} props.tableType type of table used for therapeutic targets
 * @param {array} props.visibleColumns array of column ids that are visible
 * @param {func} props.syncVisibleColumns function to propagate visible column changes
 * @param {bool} props.canToggleColumns can visible/hidden columns be toggled
 * @return {*} JSX
 */
function DataTable(props) {
  const {
    rowData,
    columnDefs,
    arrayColumns,
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
  } = props;

  const gridApi = useRef();
  const columnApi = useRef();
  const optionsMenuOnClose = useRef();

  const setOptionsMenuOnClose = (ref) => {
    optionsMenuOnClose.current = ref;
  };

  const [showPopover, setShowPopover] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
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

    const { visibleColumnIds } = getColumnVisibility();
    columnApi.current.autoSizeColumns(visibleColumnIds);
  };

  const onGridSizeChanged = (params) => {
    const MEDIUM_SCREEN_WIDTH_LOWER = 992;

    if (params.clientWidth >= MEDIUM_SCREEN_WIDTH_LOWER) {
      gridApi.current.sizeColumnsToFit();
    } else {
      const allCols = columnApi.current.getAllColumns().map(col => col.colId);
      columnApi.current.autoSizeColumns(allCols);
    }
  };

  const rowEditStart = (editRowNode) => {
    setSelectedRow(editRowNode);
    setShowEditDialog(true);
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

  const rowClickedDetail = (event) => {
    const definedCols = columnApi.current.getAllColumns().map(col => col.colId);
    const propagateObject = Object.entries(event.data).reduce((accumulator, [key, value]) => {
      if (definedCols.includes(key)) {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});
    setSelectedRow(propagateObject);
    setShowDetailDialog(true);
  };

  const handleDetailClose = () => {
    setShowDetailDialog(false);
  };

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    editable: false,
    onCellDoubleClicked: editable ? rowEditStart : () => {},
  };
    
  const domLayout = 'autoHeight';

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
          columns={columnApi.current.getAllColumns()}
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

  // AG-Grid has a bug where column groups aren't accounted for when calculating overlay placement
  const CustomNoRowsOverlay = () => {
    const isParentHeaders = columnDefs.some(col => col.children);

    if (isParentHeaders) {
      return (
        <div style={{ margin: '49px 0 0 0' }}>No rows to show</div>
      );
    }
    return (
      <div>No rows to show</div>
    );
  };
  
  return (
    <div className="data-table--padded">
      <div className="data-table__header-container">
        <Typography variant="h6" className="data-table__header">
          {titleText}
        </Typography>
        {addable && renderAddRow()}
        <EditDialog
          open={showEditDialog}
          close={handleRowEditClose}
          editData={selectedRow.data}
          reportIdent={reportIdent}
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
      <div className="ag-theme-material data-table__container">
        {showPopover
          && renderOptionsMenu()
        }
        <DetailDialog
          open={showDetailDialog}
          selectedRow={selectedRow}
          onClose={handleDetailClose}
          arrayColumns={arrayColumns}
        />
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
          autoSizePadding="0"
          onGridSizeChanged={onGridSizeChanged}
          onRowClicked={!editable ? rowClickedDetail : null}
          editType="fullRow"
          frameworkComponents={{
            EditDialog,
            CustomNoRowsOverlay,
          }}
          noRowsOverlayComponent="CustomNoRowsOverlay"
        />
      </div>
    </div>
  );
}

DataTable.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  arrayColumns: PropTypes.arrayOf(PropTypes.string),
  rowData: PropTypes.arrayOf(PropTypes.object),
  titleText: PropTypes.string,
  filterText: PropTypes.string,
  editable: PropTypes.bool,
  EditDialog: PropTypes.func,
  addable: PropTypes.bool,
  reportIdent: PropTypes.string,
  tableType: PropTypes.string,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  syncVisibleColumns: PropTypes.func,
  canToggleColumns: PropTypes.bool,
};

DataTable.defaultProps = {
  rowData: [],
  filterText: '',
  arrayColumns: [],
  titleText: '',
  editable: false,
  EditDialog: () => null,
  addable: false,
  reportIdent: '',
  tableType: '',
  visibleColumns: [],
  syncVisibleColumns: null,
  canToggleColumns: false,
};

export default DataTable;
