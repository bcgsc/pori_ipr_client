import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import startCase from 'lodash.startcase';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './reports-table.scss';

/**
 * @param {*} rowData Row data to display in table
 * @return {*} JSX
 */
function ReportsTableComponent({ rowData, reportType, $state }) {
  const [gridApi, setGridApi] = useState(null);

  const columnDefs = Object.keys(rowData[0]).map(key => ({
    headerName: startCase(key),
    field: key,
    floatingFilterComponentParams: { suppressFilterButton: true },
  }));

  // enable natural sorting for the Patient ID column and make it the default
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const patientCol = columnDefs.findIndex(col => col.field === 'patientID');
  columnDefs[patientCol].comparator = collator.compare;
  columnDefs[patientCol].sort = 'desc';

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = () => {
    const selectedRow = gridApi.getSelectedRows();
    $state.go(`root.reportlisting.pog.${reportType}.summary`, {
      POG: selectedRow[0].patientID, analysis_report: selectedRow[0].identifier,
    });
  };

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  return (
    <div className="ag-theme-material reports-table__container">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
        pagination
        paginationAutoPageSize
        floatingFilter
        rowSelection="single"
        onSelectionChanged={onSelectionChanged}
        onGridReady={onGridReady}
      />
    </div>
  );
}

ReportsTableComponent.propTypes = {
  rowData: PropTypes.array.isRequired,
  reportType: PropTypes.string.isRequired,
  $state: PropTypes.object.isRequired,
};

export default ReportsTableComponent;
