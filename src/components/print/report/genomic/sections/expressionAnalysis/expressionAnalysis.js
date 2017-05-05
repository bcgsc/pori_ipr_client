app.controller('controller.print.POG.report.genomic.expressionAnalysis',
['_', '$scope', '$sce', 'pog', 'report', 'images', 'outliers', 'drugTargets', 'densityGraphs',
(_, $scope, $sce, pog, report, images, outliers, drugTargets, densityGraphs) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.drugTargets = drugTargets;
  $scope.densityGraphs = [];

  // Convert full hex to 6chr
  $scope.colourHex = (hex) => {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  };

  $scope.titleMap = {
    clinical: 'Expression Level Outliers of Potential Clinical Relevance',
    nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
    biological: 'Expression Level Outliers of Biological Relevance',
  };

  // Sort outliers into categories
  let processOutliers = (outs) => {

    let outliers = {
      clinical: [],
      nostic: [],
      biological: []
    };

    // Run over mutations and group
    _.forEach(outs, (row, k) => {
      if(!(row.outlierType in outliers)) outliers[row.outlierType] = [];
      // Add to type
      outliers[row.outlierType].push(row);
    });

    // Set Small Mutations
    $scope.expOutliers = outliers;
  };

  processOutliers(outliers);

  let i = 0;

  let arrayGraphs = []
  _.forEach(densityGraphs, (g) => {
    arrayGraphs.push(g);
  });

  while(i < arrayGraphs.length) {

    $scope.densityGraphs.push([arrayGraphs[i], arrayGraphs[i+1]]);
    i = i + 2;
  }

}]);