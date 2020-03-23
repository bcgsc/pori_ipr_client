import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import omit from 'lodash.omit';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './index.scss';

/**
 * @param {object} props props
 * @property {array} therapeuticRowData therapeutic and chemoresistance row data
 * @return {*} JSX
 */
function TherapeuticTableComponent(props) {
  let {
    therapeuticRowData,
  } = props;

  let chemoresistanceRowData = [];
  let therapeuticColDefs = [];
  let chemoresistanceColDefs = [];

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

  const overlayNoRowsTemplate = emptyText => (
    `<span>No ${emptyText} was found</span>`
  );
  
  const domLayout = 'autoHeight';

  const filterRows = (rowData, type, omitFields) => rowData.filter(row => row.type === type)
    .map(row => omit(row, omitFields));

  const makeColDefs = (columnNames, breakCols) => {
    const returnColDefs = [];

    columnNames.forEach((col) => {
      if (breakCols.includes(col)) {
        returnColDefs.push({
          headerName: `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
          field: col,
          cellRenderer: (params) => {
            const gui = document.createElement('span');
            gui.innerHTML = params.data[col].join('</br>');
            return gui;
          },
          autoHeight: true,
          cellClass: ['cell-wrap-text', 'cell-line-height'],
        });
      } else {
        returnColDefs.push({
          // Split the only header with 2 words
          headerName: col === 'targetContext' ? 'Target Context' : `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
          field: col,
          autoHeight: true,
          cellClass: ['cell-wrap-text', 'cell-line-height'],
        });
      }
    });
    
    return returnColDefs;
  };

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

    chemoresistanceRowData = filterRows(
      therapeuticRowData,
      'chemoresistance',
      [
        'createdAt',
        'ident',
        'rank',
        'target',
        'targetContext',
        'type',
        'updatedAt',
      ],
    );

    therapeuticRowData = filterRows(
      therapeuticRowData,
      'therapeutic',
      [
        'createdAt',
        'ident',
        'rank',
        'resistance',
        'type',
        'updatedAt',
      ],
    );

    const therapeuticColNames = Object.keys(therapeuticRowData[0]);
    therapeuticColDefs = makeColDefs(therapeuticColNames, ['biomarker', 'target']);
  }

  if (chemoresistanceRowData.length) {
    const chemoresistanceColNames = Object.keys(chemoresistanceRowData[0]);
    chemoresistanceColDefs = makeColDefs(chemoresistanceColNames, ['biomarker']);
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
          overlayNoRowsTemplate={overlayNoRowsTemplate('therapeutic options data')}
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
          overlayNoRowsTemplate={overlayNoRowsTemplate('chemoresistance data')}
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
