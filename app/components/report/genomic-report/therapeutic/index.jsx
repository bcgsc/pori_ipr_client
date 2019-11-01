import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './therapeutic.scss';

/**
 * @param {object} props props
 * @property {array} therapeuticRowData therapeutic and chemoresistance row data
 * @return {*} JSX
 */
function TherapeuticTableComponent(props) {
  let {
    therapeuticRowData,
  } = props;
  let chemoresistanceRowData;
  const therapeuticColDefs = [];
  const chemoresistanceColDefs = [];

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

  if (therapeuticRowData.length) {
    // target and biomarker are objects and need to be strings to be displayed w/ag-grid
    therapeuticRowData = therapeuticRowData.map((row) => {
      if (row.target.every(target => typeof target === 'object')) {
        row.target = row.target.map(({ geneVar }) => geneVar);
      }
      row.biomarker = row.biomarker.map(({
        entry, context,
      }) => [entry, context].join(': '));
      return row;
    });

    // Chemoresistance table data setup
    chemoresistanceRowData = therapeuticRowData.filter(
      row => row.type === 'chemoresistance',
    ).map(({
      createdAt, ident, rank, target, targetContext, type, updatedAt, ...keepRow
    }) => keepRow);

    // Therapeutic table data setup
    therapeuticRowData = therapeuticRowData.filter(
      row => row.type === 'therapeutic',
    ).map(({
      createdAt, ident, rank, resistance, type, updatedAt, ...keepRow
    }) => keepRow);

    const therapeuticColumnNames = Object.keys(therapeuticRowData[0]);

    therapeuticColumnNames.forEach((col) => {
      if (col === 'biomarker' || col === 'target') {
        therapeuticColDefs.push({
          headerName: `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
          field: col,
          cellRenderer: (params) => {
            const gui = document.createElement('span');
            gui.innerHTML = params.data[col].join('</br>');
            return gui;
          },
          autoHeight: true,
          cellClass: 'cell-wrap-text',
        });
      } else {
        therapeuticColDefs.push({
          // Split the only header with 2 words
          headerName: col === 'targetContext' ? 'Target Context' : `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
          field: col,
          autoHeight: true,
          cellClass: 'cell-wrap-text',
        });
      }
    });
  }

  if (chemoresistanceRowData.length) {
    const chemoresistanceColumnNames = Object.keys(chemoresistanceRowData[0]);

    chemoresistanceColumnNames.forEach((col) => {
      if (col === 'biomarker') {
        chemoresistanceColDefs.push({
          headerName: `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
          field: col,
          cellRenderer: (params) => {
            const gui = document.createElement('span');
            gui.innerHTML = params.data.biomarker.join('</br>');
            return gui;
          },
          autoHeight: true,
          cellClass: 'cell-wrap-text',
        });
      } else {
        chemoresistanceColDefs.push({
          headerName: `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
          field: col,
          autoHeight: true,
          cellClass: 'cell-wrap-text',
        });
      }
    });
  }

  return (
    <div>
      <div className="therapeutic-table__title">Potential Therapeutic Options</div>
      <div className="ag-theme-material therapeutic-table__container">
        <AgGridReact
          columnDefs={therapeuticColDefs}
          rowData={therapeuticRowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
        />
      </div>
      <div className="therapeutic-table__title">Potential Chemoresistance</div>
      <div className="ag-theme-material therapeutic-table__container">
        <AgGridReact
          columnDefs={chemoresistanceColDefs}
          rowData={chemoresistanceRowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
        />
      </div>
    </div>
  );
}

TherapeuticTableComponent.propTypes = {
  therapeuticRowData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TherapeuticTableComponent;
