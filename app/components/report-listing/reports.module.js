import angular from 'angular';
import { react2angular } from 'react2angular';
import moment from 'moment';

import reportsTable from './reports-table';

export default angular.module('genomic', [])
  .component('reportsTable', react2angular(reportsTable, ['rowData', 'columnDefs'], ['$state']))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.reports', {
        url: '/reports',
        component: 'reportsTable',
        resolve: {
          rowData: ['ReportService', 'isExternalMode',
            async (ReportService, isExternalMode) => {
              const opts = {};

              opts.all = true;
              opts.states = 'ready,active,presented,uploaded,signedoff,archived';

              if (isExternalMode) {
                opts.states = 'presented,archived';
              }
              let { reports } = await ReportService.allFiltered(opts);

              // Remove Dustin's test reports that are missing the patient info section
              reports = reports.filter(r => r.patientInformation);

              return reports.map((report) => {
                const [analyst] = report.users
                  .filter(u => u.role === 'analyst' && !u.deletedAt)
                  .map(u => u.user);
                
                return {
                  patientID: report.pog.POGID,
                  analysisBiopsy: report.analysis.analysis_biopsy,
                  reportType: report.type === 'genomic' ? 'Genomic' : 'Targeted Gene',
                  state: report.state,
                  caseType: report.patientInformation.caseType,
                  project: report.pog.projects.map(project => project.name).sort().join(', '),
                  physician: report.patientInformation.physician,
                  analyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
                  tumourType: report.patientInformation.tumourType,
                  reportID: report.ident,
                  date: report.createdAt,
                };
              });
            }],
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
