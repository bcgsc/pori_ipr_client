import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from '@ag-grid-community/react';
import omit from 'lodash.omit';

import './index.scss';

/**
 * @param {object} props props
 * @property {array} therapeuticRowData therapeutic and chemoresistance row data
 * @property {bool} print is this used on the print page
 * @return {*} JSX
 */
function TherapeuticTableComponent(props) {
  let {
    therapeuticRowData,
    print,
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

  const filterRows = (rowData, type, omitFields) => rowData.filter(row => row.type === type)
    .map(row => omit(row, omitFields));

  const makeColDefs = (columnNames) => {
    const returnColDefs = [];

    columnNames.forEach((col) => {
      // Custom widths for columns
      returnColDefs.push({
        headerName: `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
        field: col,
        autoHeight: true,
        flex: col === 'notes' ? 1 : null,
        maxWidth: (() => {
          if (col === 'notes') { return null; }
          if (col === 'therapy') { return 180; }
          return 110;
        })(),
        hide: col === 'rank',
        sort: col === 'rank' ? 'asc' : null,
        cellClass: ['cell-wrap-text', 'cell-line-height'],
      });
    });
    return returnColDefs;
  };

  if (therapeuticRowData.length) {
    // target and biomarker are objects and need to be strings to be displayed w/ag-grid
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
        'geneGraphkbId',
        'variantGraphkbId',
        'therapyGraphkbId',
        'contextGraphkbId',
        'evidenceLevelGraphkbId',
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
        'geneGraphkbId',
        'variantGraphkbId',
        'therapyGraphkbId',
        'contextGraphkbId',
        'evidenceLevelGraphkbId',
      ],
    );

    const therapeuticColNames = Object.keys(therapeuticRowData[0]);
    therapeuticColDefs = makeColDefs(therapeuticColNames);
  }

  if (chemoresistanceRowData.length) {
    const chemoresistanceColNames = Object.keys(chemoresistanceRowData[0]);
    chemoresistanceColDefs = makeColDefs(chemoresistanceColNames);
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
          domLayout={print ? 'print' : 'autoHeight'}
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
          domLayout={print ? 'print' : 'autoHeight'}
        />
      </div>
    </div>
  );
}

TherapeuticTableComponent.propTypes = {
  therapeuticRowData: PropTypes.arrayOf(PropTypes.object).isRequired,
  print: PropTypes.bool,
};

TherapeuticTableComponent.defaultProps = {
  print: false,
};

export default TherapeuticTableComponent;
