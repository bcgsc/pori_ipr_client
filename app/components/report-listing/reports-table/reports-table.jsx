import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './reports-table.scss';

/**
 * @param {*} rowData Row data to display in table
 * @return {*} JSX
 */
function ReportsTableComponent({ rowData, columnDefs, $state }) {
  const [gridApi, setGridApi] = useState(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = () => {
    const selectedRow = gridApi.getSelectedRows();
    let { reportType } = selectedRow[0];
    reportType = reportType === 'Genomic' ? 'genomic' : 'probe';
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
  columnDefs: PropTypes.array.isRequired,
  $state: PropTypes.object.isRequired,
};

export default ReportsTableComponent;
