app.controller('controller.print.POG.report.genomic.copyNumberAnalysis',
['_', '$scope', '$sce', 'pog', 'report', 'copyNumberAnalysisImages', 'cnvs', 'ms',
(_, $scope, $sce, pog, report, copyNumberAnalysisImages, cnvs, ms) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.ms = ms;
  $scope.images = copyNumberAnalysisImages;
  $scope.cnvGroups = {};


  let processCNV = (cnvs) => {

    let container = {
      clinical: [],
      nostic: [],
      biological: [],
      commonAmplified: [],
      homodTumourSupress: [],
      highlyExpOncoGain: [],
      lowlyExpTSloss: []
    };

    // Run over mutations and group
    _.forEach(cnvs, (row, k) => {
      if(!(row.cnvVariant in container)) container[row.cnvVariant] = [];
      // Add to type
      container[row.cnvVariant].push(row);
    });

    // Set Small Mutations
    $scope.cnvGroups = container;
  };

  processCNV(cnvs);

  $scope.titleMap = {
    clinical: 'CNVs of Potential Clinical Relevance',
    nostic: 'CNVs of Prognostic or Diagnostic Relevance',
    biological: 'CNVs of Biological Relevance',
    commonAmplified: 'Commonly Amplified Oncogenes with Copy Gains',
    homodTumourSupress: 'Homozygously Deleted Tumour Suppresors',
    highlyExpOncoGain: 'Highly Expressed Oncogenes with Copy Gains',
    lowlyExpTSloss: 'Lowly Expressed Tumour Suppressors with Copy Losses'
  };


}]);