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
    gridApi.current.sizeColumnsToFit();
  };

  const onSelectionChanged = () => {
    const selectedRow = gridApi.current.getSelectedRows();
    const [{ patientID, reportID }] = selectedRow;
    let [{ reportType }] = selectedRow;

    // Convert displayed report type (Genomic, Targeted gene) back to the API values
    reportType = reportType === 'Genomic' ? 'genomic' : 'probe';
    $state.go(`root.reportlisting.pog.${reportType}.summary`, {
      POG: patientID, analysis_report: reportID,
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
        rowSelection="single"
        onSelectionChanged={onSelectionChanged}
        onGridReady={onGridReady}
      />
    </div>
  );
}

ReportsTableComponent.propTypes = {
  rowData: PropTypes.arrayOf(PropTypes.object).isRequired,
  columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
  $state: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default ReportsTableComponent;
