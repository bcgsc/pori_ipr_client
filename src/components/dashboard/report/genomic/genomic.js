app.controller('controller.dashboard.report.genomic', 
  ['_', '$q', '$scope', '$state', 'api.pog', 'pog',
  (_, $q, $scope, $state, $pog, pog) => {

  $scope.pog = pog;



  $scope.openPrint = () => {
    // State go!
    window.open($state.href('print.POG.report.genomic',{POG: pog.POGID}), '_blank');
  };

  $scope.sections = [
    {
      name: 'Analyst Comments',
      state: 'analystComments',
      showChildren: false,
      children: []
    },
    {
      name: 'Pathway Analysis',
      state: 'pathwayAnalysis',
      showChildren: false,
      children: []
    },
    {
      name: 'Detailed Genomic Analysis',
      state: 'detailedGenomicAnalysis',
      showChildren: false,
      children: [
        { name: 'Targeted Gene Report', state: 'detailedGenomicAnalysis'}
      ]
    },
    {
      name: 'Disease Specific Analysis',
      state: 'diseaseSpecificAnalysis',
      showChildren: false,
      children: []
    },
    {
      name: 'Somatic Mutations',
      state: 'somaticMutations',
      showChildren: false,
      children: []
    },
    {
      name: 'Copy Number Analyses',
      state: 'copyNumberAnalyses',
      showChildren: false,
      children: []
    },
    {
      name: 'Structural Variation',
      state: 'structuralVariation',
      showChildren: false,
      children: []
    },
    {
      name: 'Expression Analysis',
      state: 'expressionAnalysis',
      showChildren: false,
      children: []
    },
    {
      name: 'Appendices',
      state: 'appendices',
      showChildren: false,
      children: []
    },
    {
      name: 'Meta',
      state: 'meta',
      showChildren: false,
      children: []
    }
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
    
    $state.go('^.' + goto);
  };
  
}]);
