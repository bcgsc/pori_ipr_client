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
      clinician: true,
      children: []
    },
    {
      name: 'Pathway Analysis',
      state: 'pathwayAnalysis',
      meta: false,
      showChildren: false,
      clinician: true,
      children: []
    },
    {
      name: 'Potential Therapeutic Targets',
      state: 'therapeutic',
      meta: false,
      showChildren: false,
      clinician: true,
      children: []
    },
    {
      name: 'Presentation',
      state: 'presentation',
      meta: false,
      showChildren: false,
      clinician: true,
      children: [
        {name: 'Additional Information', state: 'slide'},
        {name: 'Discussion Notes', state: 'discussion'}
      ]
    },
    {
      name: 'Detailed Genomic Analysis',
      state: null,
      meta: false,
      showChildren: false,
      clinician: true,
      category: true,
      children: [
        { name: 'Knowledgebase Matches', state: 'knowledgebase'},
        { name: 'DNA Repair', state: null, disabled: true},
        { name: 'Microbial', state: 'microbial'},
        { name: 'Spearman', state: 'spearman'},
        { name: 'HRD', state: 'hrd', disabled: true},
        { name: 'Disease Specific', state: 'diseaseSpecificAnalysis'},
      ]
    },
    {
      name: 'Somatic',
      state: null,
      meta: false,
      showChildren: false,
      clinician: true,
      category: true,
      children: [
        { name: 'Small Mutations', state: 'smallMutations'},
        { name: 'Copy Number Variants', state: 'copyNumberAnalyses'},
        { name: 'Structural Variants', state: 'structuralVariation'},
      ]
    },
    {
      name: 'Expression',
      state: 'expressionAnalysis',
      meta: false,
      showChildren: false,
      clinician: true,
      children: []
    },
    {
      name: 'Appendices',
      state: 'appendices',
      meta: false,
      showChildren: false,
      clinician: true,
      children: []
    },
    {
      name: 'History',
      state: 'history',
      meta: true,
      showChildren: false,
      clinician: false,
      children: []
    },
    {
      name: 'Report Settings',
      state: 'meta',
      meta: true,
      showChildren: false,
      clinician: false,
      children: []
    }
  ];

  /**
   * Check if the provided state is the current one
   *
   * @param state
   * @returns {boolean}
   */
  $scope.activeSection = (state) => {
    if($state.current.name.indexOf(state) > -1) {
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
  };
  
}]);
