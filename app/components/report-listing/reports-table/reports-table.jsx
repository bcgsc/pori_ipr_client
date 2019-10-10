import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './reports-table.scss';

/**
 * @param {Object} rowData Row data to display in table
 * @return {*} JSX
 */
function ReportsTableComponent({ rowData, columnDefs, $state }) {
  const gridApi = useRef();

  const onGridReady = (params) => {
    gridApi.current = params.api;
  };

  const onSelectionChanged = () => {
    const selectedRow = gridApi.current.getSelectedRows();
    const [{ patientID, identifier }] = selectedRow;
    let [{ reportType }] = selectedRow;

    // Convert displayed report type (Genomic, Targeted gene) back to the API values
    reportType = reportType === 'Genomic' ? 'genomic' : 'probe';
    $state.go(`root.reportlisting.pog.${reportType}.summary`, {
      POG: patientID, analysis_report: identifier,
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
  columnDefs: PropTypes.array.isRequired,
  $state: PropTypes.object.isRequired,
};

export default ReportsTableComponent;
