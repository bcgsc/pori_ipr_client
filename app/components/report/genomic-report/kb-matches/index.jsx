import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import Button from '@material-ui/core/Button';
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

  /**
   * 
   * @param {*} approvedAlterations 
   */
  const groupApprovedAlterations = (approvedAlterations) => {
    const collection = [];
    approvedAlterations.forEach((row) => {
      if (collection.length) {
        collection.forEach((entry, index) => {
          if ((entry.gene === row.gene) && (entry.variant === row.variant)) {
            collection[index].children.push(row);
          } else {
            row.children = [];
            collection.push(row); // Add row to collection
          }
        });
      } else {
        row.children = [];
        collection.push(row);
      }
    });
    return collection;
  };
  
  /**
   * 
   * @param {*} entries 
   */
  const groupEntries = (entries) => {
    const grouped = {};
    // Process the entries for grouping
    entries.forEach((row) => {
      // Create new alteration type if it's not existing
      if (!(Object.prototype.hasOwnProperty.call(grouped, row.alterationType))) {
        grouped[row.alterationType] = [];
      }
      // Check if it exists already?
      if (grouped[row.alterationType].length) {
        const match = grouped[row.alterationType].findIndex(
          entry => (entry.gene === row.gene) && (entry.variant === row.variant),
        );
        if (match > -1) {
          // Categorical entry already exists
          grouped[row.alterationType][match].children.push(row);
        } else {
          row.children = [];
          grouped[row.alterationType].push(row);
        }
      } else {
        row.children = [];
        grouped[row.alterationType].push(row);
      }
    });
    return grouped;
  };

  useEffect(() => {
    setGroupedAlterations(groupEntries(alterations));
    setGroupedApprovedThisCancer(groupApprovedAlterations(approvedThisCancer));
    setGroupedApprovedOtherCancer(groupApprovedAlterations(approvedOtherCancer));
  }, []);

  const onGridReady = (params) => {
    gridApi.current = params.api;
    gridApi.current.sizeColumnsToFit();
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
    cellRendererFramework: () => (<Button variant="outlined" size="small">Details</Button>),
  }];

  const domLayout = 'autoHeight';

  return (
    <div>
      <div className="ag-theme-material reports-table__container">
        <AgGridReact
          columnDefs={colDefs}
          rowData={groupedApprovedThisCancer}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
        />
      </div>
      <div className="ag-theme-material reports-table__container">
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
          <div className="kb-matches__header">
            {`${startCase(key)} `}
            Alterations
          </div>
          <div className="ag-theme-material reports-table__container">
            <AgGridReact
              columnDefs={colDefs}
              rowData={alterationByType}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              domLayout={domLayout}
            />
          </div>
        </div>
      ))}
      <Button variant="contained" color="primary" onClick={() => setShowUnknownAlterations(!showUnknownAlterations)}>
        {showUnknownAlterations ? 'Hide ' : 'Show '}
        Uncharacterized Alterations
      </Button>
      {showUnknownAlterations && (
        <div className="ag-theme-material reports-table__container">
          <AgGridReact
            columnDefs={colDefs}
            rowData={unknownAlterations}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            domLayout={domLayout}
          />
        </div>
      )}
      <Button variant="contained" color="primary" onClick={() => setShowNovelAlterations(!showNovelAlterations)}>
        {showNovelAlterations ? 'Hide ' : 'Show '}
        Alterations For Review
      </Button>
      {showNovelAlterations && (
        <div className="ag-theme-material reports-table__container">
          <AgGridReact
            columnDefs={colDefs}
            rowData={novelAlterations}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            domLayout={domLayout}
          />
        </div>
      )}
      <div className="ag-theme-material reports-table__container">
        <AgGridReact
          columnDefs={colDefs}
          rowData={targetedGenes}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          domLayout={domLayout}
        />
      </div>
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
