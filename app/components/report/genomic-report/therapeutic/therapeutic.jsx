import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

/**
 * @param {Object} rowData Row data to display in table
 * @return {*} JSX
 */
function TherapeuticTableComponent({ therapeuticRowData, therapeuticColumnDefs }) {
  console.log(therapeuticRowData);
  const gridApi = useRef();

  const onGridReady = (params) => {
    gridApi.current = params.api;
    gridApi.current.sizeColumnsToFit();
  };

  const defaultColDef = {
    sortable: false,
    resizable: false,
    filter: false,
  };

  return (
    <div className="ag-theme-material reports-table__container">
      <AgGridReact
        columnDefs={therapeuticColumnDefs}
        rowData={therapeuticRowData}
        pagination={false}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
      />
    </div>
  );
}

TherapeuticTableComponent.propTypes = {
  therapeuticRowData: PropTypes.array.isRequired,
  therapeuticColumnDefs: PropTypes.array.isRequired,
};

export default TherapeuticTableComponent;
