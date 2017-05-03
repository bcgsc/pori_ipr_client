app.directive("iprReportCard", ['$q', '_', '$mdDialog', '$mdToast', '$state', ($q, _, $mdDialog, $mdToast, $state) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      report: '=report',
      pog: '=pog'
    },
    templateUrl: 'ipr-report-card/ipr-report-card.html',
    link: (scope, element, attr) => {

      scope.goToReport = (report) => {
        if(report.type === 'genomic') $state.go('dashboard.pog.report.genomic.summary', {POG: scope.pog.POGID, analysis_report: report.ident});
        if(report.type === 'probe') $state.go('dashboard.pog.report.probe.summary', {POG: scope.pog.POGID, analysis_report: report.ident});
      }


    } // end link
  }; // end return

}]);
