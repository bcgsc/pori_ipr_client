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

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './index.scss';

/**
 * @param {object} props props
 * @param {array} props.rowData table row data
 * @param {array} props.columnDefs column definitions for ag-grid
 * @param {array} props.arrayColumns list of columns containing array data
 * @param {string} props.title table title
 * @param {array} props.visibleCols list of current visible columns
 * @param {array} props.hiddenCols list of current hidden columns
 * @param {func} props.setVisibleCols function to update visible cols across tables
 * @param {func} props.setHiddenCols function to update hidden cols across tables
 * @param {string} props.filterText text to filter the table on
 * @param {bool} props.editable can rows be edited?
 * @param {object} props.EditDialog Edit Dialog component
 * @param {string} props.reportIdent Ident of report (used for editing api calls)
 * @param {string} props.tableType type of table used for therapeutic targets
 * @return {*} JSX
 */
function DataTable(props) {
  const {
    rowData,
    columnDefs,
    arrayColumns,
    title,
    visibleCols,
    hiddenCols,
    setVisibleCols,
    setHiddenCols,
    filterText,
    editable,
    EditDialog,
    addable,
    reportIdent,
    tableType,
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
    if (columnApi.current) {
      columnApi.current.setColumnsVisible(visibleCols, true);
      columnApi.current.setColumnsVisible(hiddenCols, false);
    }
  }, [visibleCols, hiddenCols]);

  useEffect(() => {
    if (gridApi.current) {
      gridApi.current.setQuickFilter(filterText);
    }
  }, [filterText]);

  const onGridReady = (params) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;

    columnApi.current.setColumnsVisible(visibleCols, true);
    columnApi.current.setColumnsVisible(hiddenCols, false);
    columnApi.current.autoSizeColumns(visibleCols);
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

      setVisibleCols(returnedVisibleCols);
      setHiddenCols(returnedHiddenCols);
      columnApi.current.autoSizeColumns(returnedVisibleCols);

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
  
  return (
    <div className="data-table--padded">
      <div className="data-table__header-container">
        <Typography variant="h6" className="data-table__header">
          {title}
        </Typography>
        {addable && renderAddRow()}
        <EditDialog
          open={showEditDialog}
          close={handleRowEditClose}
          editData={selectedRow.data}
          reportIdent={reportIdent}
          tableType={tableType}
        />
        {visibleCols.length > 0 && hiddenCols.length > 0 && (
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
          onRowClicked={!editable ? rowClickedDetail : null}
          editType="fullRow"
          frameworkComponents={{
            EditDialog,
          }}
        />
      </div>
    </div>
  );
}

DataTable.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  arrayColumns: PropTypes.arrayOf(PropTypes.string),
  rowData: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string,
  visibleCols: PropTypes.arrayOf(PropTypes.string),
  hiddenCols: PropTypes.arrayOf(PropTypes.string),
  setVisibleCols: PropTypes.func,
  setHiddenCols: PropTypes.func,
  filterText: PropTypes.string,
  editable: PropTypes.bool,
  EditDialog: PropTypes.func,
  addable: PropTypes.bool,
  reportIdent: PropTypes.string,
  tableType: PropTypes.string,
};

DataTable.defaultProps = {
  rowData: [],
  arrayColumns: [],
  title: '',
  visibleCols: [],
  hiddenCols: [],
  setVisibleCols: () => {},
  setHiddenCols: () => {},
  filterText: '',
  editable: false,
  EditDialog: () => null,
  addable: false,
  reportIdent: '',
  tableType: '',
};

export default DataTable;
