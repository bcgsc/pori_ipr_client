app.controller('controller.dashboard.report.probe',
['_', '$q', '$scope', '$state', '$timeout', '$window', 'api.pog', 'pog', 'report',
(_, $q, $scope, $state, $timeout, $window, $pog, pog, report) => {

  $scope.pog = pog;

  $scope.openPrint = () => {
    // State go!
    $window.open($state.href('print.POG.report.probe',{POG: pog.POGID, analysis_report: report.ident}), '_blank');
  };

  /**
   * Check if the provided state is the current one
   *
   * @param state
   * @returns {boolean}
   */
  $scope.activeSection = (section) => {
    if($state.current.name.indexOf(section.state) > -1) {
      return true;
    }
    return false;
  };


  $scope.goToReportSection = (goto) => {

    $state.go('^.' + goto);
  };

}]);
