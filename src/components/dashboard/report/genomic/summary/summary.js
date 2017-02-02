app.controller('controller.dashboard.report.genomic.summary', 
  ['_', '$q', '$scope', 'api.pog', 'pog', 'gai', 'get', 'ms', 'vc', 'pt',
  (_, $q, $scope, $pog, pog, gai, get, ms, vc, pt,) => {
  
  console.log('Loaded dashboard genomic report summary controller');
  
  $scope.pog = pog;
  $scope.data = {
    get: get,
    ms: ms,
    vc: vc,
    pt: pt,
    ta: pog.tumourAnalysis,
    pi: pog.patientInformation
  }
  $scope.geneVariants = [];
  
  let variantCategory = (variant) => {
    let cnvs = ['copy gain','copy loss', 'amplification', 'Homozygous Loss', 'Homozygous Gain'];
    
    // Small Mutations
    if(variant.geneVariant.match(/([A-z0-9]*)\s(\(\p\.[A-z]*[0-9]*[A-z]*\))/g)) {
      variant.type = "smallMutation";
      return variant;
    }
    
    // Structural Variants
    if(variant.geneVariant.match(/([A-z0-9]*\:\:[A-z0-9]*\s\(\e([0-9]*|\?)\:\e([0-9]*|\?)\))/g)) {
      variant.type = "structuralVariant";
      return variant;
    }
    
    // Expression Outliers
    if(variant.geneVariant.toLowerCase().indexOf('expression') !== -1) {
      variant.type = "expressionOutlier";
      return variant;
    }
    
    // Return CNV mutation
    variant.type = "cnv"
    return variant;
    
  }
  
  // Process variants and create chunks
  gai.forEach((variant, k) => {
    gai[k] = variantCategory(variant);
  });
  
  
  
  $scope.data.gai = _.sortBy(gai, 'type');
  
  $scope.mutationBurdenFilter = (input) => {
    return (input == "nan [nan]") ? 'na' : input.replace(/\[[0-9]*\]/g, '');
  }
  
  console.log('Init values', $scope.data);
  
}]);
