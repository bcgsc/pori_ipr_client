import angular from 'angular';
import { react2angular } from 'react2angular';
import moment from 'moment';

import reportsTable from './reports-table';

export default angular.module('genomic', [])
  .component('reportsTable', react2angular(reportsTable, ['columnDefs', 'isExternalMode'], ['$state', 'ReportService']))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.reports', {
        url: '/reports',
        component: 'reportsTable',
        resolve: {
          columnDefs: ['isExternalMode', async (isExternalMode) => {
            // enable natural sorting for the Patient ID column and make it the default
            const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

            const dateCellRenderer = (params) => {
              const gui = document.createElement('span');
              gui.innerHTML = moment(params.value).format('L');
              return gui;
            };

            const defs = [{
              headerName: 'Patient ID',
              field: 'patientID',
              comparator: collator.compare,
            },
            {
              headerName: 'Analysis Biopsy',
              field: 'analysisBiopsy',
            },
            {
              headerName: 'Report Type',
              field: 'reportType',
            },
            {
              headerName: 'State',
              field: 'state',
            },
            {
              headerName: 'Case Type',
              field: 'caseType',
            },
            {
              headerName: 'Project',
              field: 'project',
            },
            {
              headerName: 'Tumour Type',
              field: 'tumourType',
            },
            {
              headerName: 'Report ID',
              field: 'reportID',
            },
            {
              headerName: 'Date Created',
              field: 'date',
              sort: 'desc',
              cellRenderer: dateCellRenderer,
            }];

            // Show physician to external users, analyst to internal
            if (isExternalMode) {
              defs.push({
                headerName: 'Physician',
                field: 'physician',
              });
            } else {
              defs.push({
                headerName: 'Analyst',
                field: 'analyst',
              });
            }

            return defs;
          }],
        },
      });
  })
  .name;
