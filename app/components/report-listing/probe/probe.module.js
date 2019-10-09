import angular from 'angular';
import { react2angular } from 'react2angular';

import reportsTable from '../reports-table';

export default angular.module('probe', [])
  .component('probeReportsTable', react2angular(reportsTable, ['rowData', 'reportType'], ['$state']))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.probe', {
        url: '/probe',
        component: 'probeReportsTable',
        resolve: {
          rowData: ['ReportService', 'isExternalMode', async (ReportService, isExternalMode) => {
            const opts = {
              type: 'probe',
              all: true,
            };

            opts.states = 'uploaded,signedoff';

            if (isExternalMode) {
              opts.states = 'reviewed';
              opts.paginated = true;
            }
            let { reports } = await ReportService.allFiltered(opts);

            reports = reports.filter(r => r.patientInformation);

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
          reportType: () => 'probe',
        },
      });
  })
  .name;
