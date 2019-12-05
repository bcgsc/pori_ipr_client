import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  Button,
  Typography,
} from '@material-ui/core';
import startCase from 'lodash.startcase';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './index.scss';

/**
 * @param {object} props props
 * @property {array} props.rowData table row data
 * @property {array} props.columnDefs column definitions for ag-grid
 * @property {object} props.$state angularjs state service
 * @return {*} JSX
 */
function ReportsTableComponent(props) {
  const {
    alterations,
    novelAlterations,
    unknownAlterations,
    approvedThisCancer,
    approvedOtherCancer,
    targetedGenes,
  } = props;

  const gridApi = useRef();
  const [showUnknownAlterations, setShowUnknownAlterations] = useState(false);
  const [showNovelAlterations, setShowNovelAlterations] = useState(false);
  const [groupedAlterations, setGroupedAlterations] = useState({});
  const [groupedApprovedThisCancer, setGroupedApprovedThisCancer] = useState([]);
  const [groupedApprovedOtherCancer, setGroupedApprovedOtherCancer] = useState([]);
  const [groupedUnknownAlterations, setGroupedUnknownAlterations] = useState([]);
  const [groupedNovelAlterations, setGroupedNovelAlterations] = useState([]);

  const coalesceEntries = entries => [...new Set(entries)];
  
  const groupCategories = (entries) => {
    const grouped = {};
    entries.forEach((row) => {
      if (!(Object.prototype.hasOwnProperty.call(grouped, row.alterationType))) {
        grouped[row.alterationType] = new Set();
      }
      grouped[row.alterationType].add(row);
    });
    Object.entries(grouped).map(group => [...group]);
    return grouped;
  };

  useEffect(() => {
    setGroupedAlterations(groupCategories(alterations));
    setGroupedApprovedThisCancer(coalesceEntries(approvedThisCancer));
    setGroupedApprovedOtherCancer(coalesceEntries(approvedOtherCancer));
    // setGroupedUnknownAlterations(coalesceEntries(unknownAlterations));
    // setGroupedNovelAlterations(coalesceEntries(novelAlterations));
  }, []);

  const onGridReady = (params) => {
    gridApi.current = params.api;
    gridApi.current.sizeColumnsToFit();

    window.addEventListener('resize', () => params.api.sizeColumnsToFit());
  };

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  const colDefs = [{
    headerName: 'Gene',
    field: 'gene',
  },
  {
    headerName: 'Known Variant',
    field: 'kbVariant',
  },
  {
    headerName: 'Cancer Type',
    field: 'disease',
  },
  {
    headerName: 'Disease Percentile',
    field: 'expression_cancer_percentile',
  },
  {
    headerName: 'Association',
    field: 'association',
  },
  {
    headerName: 'Context',
    field: 'therapeuticContext',
  },
  {
    headerName: 'PMID',
    field: 'reference',
  },
  {
    headerName: '',
    field: '',
    cellStyle: { overflow: 'visible' },
    cellRendererFramework: () => (<Button variant="outlined" size="small">Details</Button>),
  }];

  const targetedColDefs = [{
    headerName: 'Gene',
    field: 'gene',
  },
  {
    headerName: 'Variant',
    field: 'variant',
  },
  {
    headerName: 'Source',
    field: 'sample',
  }];
    
  const domLayout = 'autoHeight';

  return (
    <div>
      <Typography variant="h6" className="kb-matches__header">
        Therapies Approved In This Cancer Type
      </Typography>
      <div className="ag-theme-material kb-matches__container">
        <AgGridReact
          columnDefs={colDefs}
          rowData={groupedApprovedThisCancer}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
        />
      </div>
      <Typography variant="h6" className="kb-matches__header">
        Therapies Approved In Other Cancer Types
      </Typography>
      <div className="ag-theme-material kb-matches__container">
        <AgGridReact
          columnDefs={colDefs}
          rowData={groupedApprovedOtherCancer}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
        />
      </div>
      {Object.entries(groupedAlterations).map(([key, alterationByType]) => (
        <div key={key}>
          <Typography variant="h6" className="kb-matches__header">
            {`${startCase(key)} `}
            Alterations
          </Typography>
          <div className="ag-theme-material kb-matches__container">
            <AgGridReact
              columnDefs={colDefs}
              rowData={alterationByType}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              domLayout={domLayout}
              sideBar
            />
          </div>
        </div>
      ))}
      <Typography variant="h6" className="kb-matches__header">
        Targeted Gene Report - Detected Alterations
      </Typography>
      <div className="ag-theme-material kb-matches__container">
        <AgGridReact
          columnDefs={targetedColDefs}
          rowData={targetedGenes}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
        />
      </div>
      <div className="kb-matches__button-container">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setShowUnknownAlterations(prevVal => !prevVal);
            setGroupedUnknownAlterations(coalesceEntries(unknownAlterations));
          }}
          classes={{ root: 'kb-matches__button' }}
        >
          {showUnknownAlterations ? 'Hide ' : 'Show '}
          Uncharacterized Alterations
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setShowNovelAlterations(prevVal => !prevVal);
            setGroupedNovelAlterations(coalesceEntries(novelAlterations));
          }}
          className="kb-matches__button"
        >
          {showNovelAlterations ? 'Hide ' : 'Show '}
          Alterations For Review
        </Button>
      </div>
      {showUnknownAlterations && (
        <div>
          <Typography variant="h6" className="kb-matches__header">
            Uncharacterized Alterations
          </Typography>
          <div className="ag-theme-material kb-matches__container">
            <AgGridReact
              columnDefs={colDefs}
              rowData={groupedUnknownAlterations}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              domLayout={domLayout}
            />
          </div>
        </div>
      )}
      {showNovelAlterations && (
        <div>
          <Typography variant="h6" className="kb-matches__header">
            Alterations For Review
          </Typography>
          <div className="ag-theme-material kb-matches__container">
            <AgGridReact
              columnDefs={colDefs}
              rowData={groupedNovelAlterations}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              domLayout={domLayout}
            />
          </div>
        </div>
      )}
    </div>
  );
}

ReportsTableComponent.propTypes = {
  alterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  novelAlterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  unknownAlterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  approvedThisCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  approvedOtherCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  targetedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ReportsTableComponent;
