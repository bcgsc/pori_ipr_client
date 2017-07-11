app.controller('controller.dashboard.report.genomic', 
  ['_', '$q', '$scope', '$state', '$timeout', '$window', 'api.pog', 'pog', 'report', '$mdDialog', '$mdToast',
  (_, $q, $scope, $state, $timeout, $window, $pog, pog, report, $mdDialog, $mdToast) => {

  $scope.pog = pog;
  $scope.report = report;

  $scope.openPrint = () => {
    // State go!
    $window.open($state.href('print.POG.report.genomic',{POG: pog.POGID, analysis_report: report.ident}), '_blank');
  };

  $scope.sections = [
    {
      name: 'Analyst Comments',
      state: 'analystComments',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Pathway Analysis',
      state: 'pathwayAnalysis',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Potential Therapeutic Targets',
      state: 'therapeutic',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Detailed Genomic Analysis',
      state: 'detailedGenomicAnalysis',
      meta: false,
      showChildren: false,
      children: [
        { name: 'Targeted Gene Report', state: 'detailedGenomicAnalysis'}
      ]
    },
    {
      name: 'Disease Specific Analysis',
      state: 'diseaseSpecificAnalysis',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Somatic Mutations',
      state: 'somaticMutations',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Copy Number Analyses',
      state: 'copyNumberAnalyses',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Structural Variation',
      state: 'structuralVariation',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Expression Analysis',
      state: 'expressionAnalysis',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Appendices',
      state: 'appendices',
      meta: false,
      showChildren: false,
      children: []
    },
    {
      name: 'Report Settings',
      state: 'meta',
      meta: true,
      showChildren: false,
      children: []
    },
  ];

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
    
    $state.go('dashboard.reports.pog.report.genomic.' + goto);
  };


  /**
   * Open export modal
   *
   */
  $scope.openExport = ($event) => {
    $mdDialog.show({
      controller: 'controller.dashboard.report.genomic.history.export',
      templateUrl: 'dashboard/report/genomic/history/history.export.html',
      targetEvent: $event,
      locals: {pog: pog},
      clickOutsideToClose: false,
    }).then(
      (result) => {
        // Result of hidden
      },
      () => {
        // Closed
      }
    );
  }
  
}]);
