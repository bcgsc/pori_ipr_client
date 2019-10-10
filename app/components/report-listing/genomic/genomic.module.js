import angular from 'angular';
import { react2angular } from 'react2angular';

import reportsTable from '../reports-table/reports-table';

export default angular.module('genomic', [])
  .component('genomicReportsTable', react2angular(reportsTable, ['rowData', 'columnDefs'], ['$state']))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.genomic', {
        url: '/genomic',
        component: 'genomicReportsTable',
        resolve: {
          rowData: ['ReportService', 'UserService', 'isExternalMode',
            async (ReportService, UserService, isExternalMode) => {
              const currentUser = await UserService.getSetting('genomicReportListCurrentUser');
              const project = await UserService.getSetting('selectedProject') || { name: undefined };
              
              const opts = {};

              if (!(currentUser === null || currentUser === undefined || currentUser === true)) {
                opts.all = true;
              }
              opts.states = 'ready,active,presented,uploaded,signedoff';
              opts.project = project.name;

              if (isExternalMode) {
                opts.states = 'presented,archived';
              }
              let { reports } = await ReportService.allFiltered(opts);

              reports = reports.filter(r => r.patientInformation);

              return reports.map(report => ({
                patientID: report.pog.POGID,
                analysisBiopsy: report.analysis.analysis_biopsy,
                tumourType: report.patientInformation.tumourType,
                reportType: report.type === 'genomic' ? 'Genomic' : 'Targeted Gene',
                physician: report.patientInformation.physician,
                state: report.state,
                caseType: report.patientInformation.caseType,
                identifier: report.ident,
                alternateIdentifier: report.analysis.pog.alternate_identifier || 'N/A',
              }));
            }],
          columnDefs: () => {
            // enable natural sorting for the Patient ID column and make it the default
            const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

            const defs = [{
              headerName: 'Patient ID',
              field: 'patientID',
              comparator: collator.compare,
              sort: 'desc',
            },
            {
              headerName: 'Analysis Biopsy',
              field: 'analysisBiopsy',
            },
            {
              headerName: 'Tumour Type',
              field: 'tumourType',
            },
            {
              headerName: 'Report Type',
              field: 'reportType',
            },
            {
              headerName: 'Physician',
              field: 'physician',
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
              headerName: 'Identifier',
              field: 'identifier',
            },
            {
              headerName: 'Alternate Identifier',
              field: 'alternateIdentifier',
            }];

            return defs;
          },
        },
      });
  })
  .name;
