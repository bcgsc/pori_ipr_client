import React, {
  useEffect,
  useState,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from '@ag-grid-community/react';
import { useGrid } from '@bcgsc/react-use-grid';
import omit from 'lodash.omit';

import ReportContext from '../../../../../../components/ReportContext';
import { therapeuticGet } from '@/services/reports/therapeutic';

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
      maxWidth: (() => {
        if (col === 'notes') { return null; }
        if (col === 'therapy') { return 180; }
        return 110;
      })(),
      hide: col === 'rank' || col === 'kbStatementIds',
      sort: col === 'rank' ? 'asc' : null,
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
    loadedDispatch,
  } = props;

  const { report } = useContext(ReportContext);

  const [chemoresistanceRowData, setChemoresistanceRowData] = useState([]);
  const [therapeuticRowData, setTherapeuticRowData] = useState([]);
  const [therapeuticColDefs, setTherapeuticColDefs] = useState([]);
  const [chemoresistanceColDefs, setChemoresistanceColDefs] = useState([]);

  const {
    gridApi: therapeuticGridApi,
    onGridReady: therapeuticOnGridReady,
  } = useGrid();
  const {
    gridApi: chemoresistanceGridApi,
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
        loadedDispatch({ type: 'therapeutic' });
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
    if (gridApi) {
      gridApi.sizeColumnsToFit();
      gridApi.forEachNode(node => node.setRowHeight());
      gridApi.onRowHeightChanged();
    }
  };

  const defaultColDef = {
    autoHeight: true,
    sortable: false,
    resizable: false,
    filter: false,
    cellClass: ['cell-wrap-text', 'cell-line-height'],
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
  loadedDispatch: PropTypes.func.isRequired,
};

export default TherapeuticTable;
