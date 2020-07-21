import React, {
  useRef,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from '@ag-grid-community/react';
import omit from 'lodash.omit';

import { therapeuticGet } from '@/services/reports/therapeutic';
import useGrid from '@/services/utils/useGrid';

import './index.scss';

const overlayNoRowsTemplate = emptyText => (
  `<span>No ${emptyText} was found</span>`
);

const filterRows = (rows, type, omitFields) => rows.filter(row => row.type === type)
  .map(row => omit(row, omitFields));

const makeColDefs = (columnNames) => {
  const returnColDefs = [];

  columnNames.forEach((col) => {
    // Custom widths for columns
    returnColDefs.push({
      headerName: `${col.charAt(0).toUpperCase()}${col.slice(1)}`,
      field: col,
      flex: col === 'notes' ? 1 : null,
      maxWidth: (() => {
        if (col === 'notes') { return null; }
        if (col === 'therapy') { return 180; }
        return 110;
      })(),
      hide: col === 'rank',
      sort: col === 'rank' ? 'asc' : null,
      cellClass: ['cell-wrap-text', 'cell-line-height'],
      cellStyle: { 'white-space': 'normal' },
      autoHeight: true,
    });
  });
  return returnColDefs;
};

/**
 * @param {object} props props
 * @property {array} therapeuticRowData therapeutic and chemoresistance row data
 * @property {bool} print is this used on the print page
 * @return {*} JSX
 */
const TherapeuticTable = (props) => {
  const {
    report,
  } = props;

  const [chemoresistanceRowData, setChemoresistanceRowData] = useState([]);
  const [therapeuticRowData, setTherapeuticRowData] = useState([]);
  const [therapeuticColDefs, setTherapeuticColDefs] = useState([]);
  const [chemoresistanceColDefs, setChemoresistanceColDefs] = useState([]);

  const {
    gridApi: therapeuticGridApi,
    colApi: therapeuticColApi,
    onGridReady: therapeuticOnGridReady,
  } = useGrid();
  const {
    gridApi: chemoresistanceGridApi,
    colApi: chemoresistanceColApi,
    onGridReady: chemoresistanceOnGridReady,
  } = useGrid();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const resp = await therapeuticGet(report.ident);

        if (resp.length) {
          // target and biomarker are objects and need to be strings to be displayed w/ag-grid
          setChemoresistanceRowData(filterRows(
            resp,
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
          ));

          setTherapeuticRowData(filterRows(
            resp,
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
          ));
        }
      };
      
      getData();
    }
  }, [report]);

  useEffect(() => {
    if (therapeuticRowData.length) {
      const therapeuticColNames = Object.keys(therapeuticRowData[0]);
      setTherapeuticColDefs(makeColDefs(therapeuticColNames));
    }
  }, [therapeuticRowData]);

  useEffect(() => {
    if (chemoresistanceRowData.length) {
      const chemoresistanceColNames = Object.keys(chemoresistanceRowData[0]);
      setChemoresistanceColDefs(makeColDefs(chemoresistanceColNames));
    }
  }, [chemoresistanceRowData]);

  const onFirstDataRendered = (gridApi) => {
    if (gridApi.current) {
      gridApi.current.sizeColumnsToFit();
      gridApi.current.resetRowHeights();
    }
  };

  const defaultColDef = {
    sortable: false,
    resizable: false,
    filter: false,
  };

  return (
    <div>
      <div className="therapeutic-table__title">Potential Therapeutic Options</div>
      <div className="ag-theme-material therapeutic-table__container">
        <AgGridReact
          columnDefs={therapeuticColDefs}
          rowData={therapeuticRowData}
          defaultColDef={defaultColDef}
          onGridReady={therapeuticOnGridReady}
          overlayNoRowsTemplate={overlayNoRowsTemplate('therapeutic options data')}
          domLayout="print"
          onFirstDataRendered={() => onFirstDataRendered(therapeuticGridApi)}
        />
      </div>
      <div className="therapeutic-table__title">Potential Chemoresistance</div>
      <div className="ag-theme-material therapeutic-table__container">
        <AgGridReact
          columnDefs={chemoresistanceColDefs}
          rowData={chemoresistanceRowData}
          defaultColDef={defaultColDef}
          onGridReady={chemoresistanceOnGridReady}
          overlayNoRowsTemplate={overlayNoRowsTemplate('chemoresistance data')}
          domLayout="print"
          onFirstDataRendered={() => onFirstDataRendered(chemoresistanceGridApi)}
        />
      </div>
    </div>
  );
};

TherapeuticTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  report: PropTypes.object.isRequired,
};

export default TherapeuticTable;
