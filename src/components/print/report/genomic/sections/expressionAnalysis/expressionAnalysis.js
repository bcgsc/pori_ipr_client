app.controller('controller.print.POG.report.genomic.expressionAnalysis',
['_', '$scope', '$sce', 'pog', 'report', 'images', 'outliers', 'drugTargets', 'densityGraphs',
(_, $scope, $sce, pog, report, images, outliers, drugTargets, densityGraphs) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.drugTargets = drugTargets;
  $scope.densityGraphs = [];
  $scope.expOutliers = {};

  // Convert full hex to 6chr
  $scope.colourHex = (hex) => {
    return hex.match(/([A-z0-9]{6}$)/)[0];
  };
  
  $scope.titleMap = {
    clinical: 'Expression Level Outliers of Potential Clinical Relevance',
    nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
    biological: 'Expression Level Outliers of Biological Relevance',
    upreg_onco: 'Up-Regulated Oncogenes',
    downreg_tsg: 'Down-Regulated Tumour Suppressor Genes'
  };
  
  // Sort outliers into categories
  let processExpression = (input, type) => {
    
    let expressions = {
      clinical: [],
      nostic: [],
      biological: [],
      upreg_onco: [],
      downreg_tsg: []
    };
    
    let typekey = 'outlierType';
    if(type === 'outlier') typekey = 'outlierType';
    
    // Run over mutations and group
    _.forEach(input, (row, k) => {
      if(!(row[typekey] in expressions)) expressions[row[typekey]] = [];
      // Add to type
      expressions[row[typekey]].push(row);
    });
    
    $scope.expOutliers = expressions;
    
  };
  
  processExpression(outliers, 'outlier');

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