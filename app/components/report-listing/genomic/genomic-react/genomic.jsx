import React, { useState } from 'react';
import { react2angular } from 'react2angular';
import PropTypes from 'prop-types';
import angular from 'angular';
import { AgGridReact } from 'ag-grid-react';
import startCase from 'lodash.startcase';
import axios from 'axios';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import './genomic.scss';

/**
 * @param {*} rowData Row data to display in table
 * @return {*} JSX
 */
function ReportsTableComponent({ rowData, $state }) {
  const [gridApi, setGridApi] = useState(null);

  const columnDefs = Object.keys(rowData[0]).map(key => ({
    headerName: startCase(key),
    field: key,
    width: 230,
  }));

  // enable natural sorting for the Patient ID column and make it the default
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const patientCol = columnDefs.findIndex(col => col.field === 'patientID');
  columnDefs[patientCol].comparator = collator.compare;
  columnDefs[patientCol].sort = 'desc';

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = () => {
    const selectedRow = gridApi.getSelectedRows();
    $state.go('root.reportlisting.pog.genomic.summary', { POG: selectedRow[0].patientID, analysis_report: selectedRow[0].identifier });
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
        rowSelection="single"
        onSelectionChanged={onSelectionChanged}
        onGridReady={onGridReady}
      />
    </div>
  );
}

ReportsTableComponent.propTypes = {
  rowData: PropTypes.array.isRequired,
  $state: PropTypes.object.isRequired,
};

export default angular
  .module('genomic', [])
  .component('reportsTable', react2angular(ReportsTableComponent, ['rowData'], ['$state']))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.genomic', {
        url: '/genomic',
        component: 'reportsTable',
        resolve: {
          rowData: ['ReportService', 'UserService', 'isExternalMode',
            async (ReportService, UserService, isExternalMode) => {
              const currentUser = await UserService.getSetting('genomicReportListCurrentUser');
              const project = await UserService.getSetting('selectedProject') || { name: undefined };
              
              const opts = {
                type: 'genomic',
              };

              if (currentUser === null || currentUser === undefined || currentUser === true) {
                opts.states = 'ready,active,presented';
                opts.project = project.name;
              } else {
                opts.all = true;
                opts.states = 'ready,active,presented';
                opts.project = project.name;
              }

              if (isExternalMode) {
                opts.all = true;
                opts.states = 'presented,archived';
                opts.paginated = true;
              }
              const { reports } = await ReportService.allFiltered(opts);

              return reports.map(report => ({
                patientID: report.pog.POGID,
                analysisBiopsy: report.analysis.analysis_biopsy,
                tumourType: report.patientInformation.tumourType,
                physician: report.patientInformation.physician,
                state: report.state,
                caseType: report.patientInformation.caseType,
                identifier: report.ident,
                alternateIdentifier: report.analysis.pog.alternate_identifier || 'N/A',
              }));
            }],
        },
      });
  })
  .name;
