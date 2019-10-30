import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './therapeutic.scss';

/**
 * @param {Object} rowData Row data to display in table
 * @return {*} JSX
 */
function TherapeuticTableComponent({ therapeuticRowData, therapeuticColumnDefs }) {
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

  const domLayout = 'autoHeight';

  return (
    <div className="ag-theme-material therapeutic-table__container">
      <AgGridReact
        columnDefs={therapeuticColumnDefs}
        rowData={therapeuticRowData}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        domLayout={domLayout}
      />
    </div>
  );
}

TherapeuticTableComponent.propTypes = {
  therapeuticRowData: PropTypes.array.isRequired,
  therapeuticColumnDefs: PropTypes.array.isRequired,
};

export default TherapeuticTableComponent;
