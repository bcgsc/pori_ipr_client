app.controller('controller.print.POG.report.genomic.summary',
['_', '$scope', 'pog', 'report', 'gai', 'get', 'ms', 'vc', 'pt', 'microbial',
(_, $scope, pog, report, gai, get, ms, vc, pt, microbial) => {

  // Data
  $scope.data = {
    gai: gai, 
    ms: ms, 
    vc: vc, 
    pt: pt, 
    pi: report.patientInformation, 
    ta: report.tumourAnalysis,
    microbial: (microbial !== null) ? microbial : {species: "None", integrationSite: "None"}
  };

  $scope.data.get = [];
  $scope.data.get = get;
  $scope.report = report;
  $scope.pog = pog;


  let variantCategory = (variant) => {
    let cnvs = ['copy gain', 'copy loss', 'amplification', 'Homozygous Loss', 'Homozygous Gain'];

    // Small Mutations
    if (variant.geneVariant.match(/([A-z0-9]*)\s(\(\p\.[A-z]*[0-9]*[A-z_0-9]*\*?\))/g)) {
      variant.type = "smallMutation";
      return variant;
    }

    // Structural Variants
    if (variant.geneVariant.match(/([A-z0-9]*\:\:[A-z0-9]*\s\(\e([0-9]*|\?)\:\e([0-9]*|\?)\))/g)) {
      variant.type = "structuralVariant";
      return variant;
    }

    // Expression Outliers
    if (variant.geneVariant.toLowerCase().indexOf('expression') !== -1) {
      variant.type = "expressionOutlier";
      return variant;
    }

    // Return CNV mutation
    variant.type = "cnv";
    return variant;

  };

  // Process variants and create chunks
  let processVariants = (variants) => {

    let output = [];

    // Reset counts
    $scope.variantCounts = { cnv: 0, smallMutation: 0, expressionOutlier: 0, structuralVariant: 0 };

    variants.forEach((variant, k) => {
      // Add processed Variant
      output.push(variantCategory(variant));

      // Update counts
      if (!$scope.variantCounts[gai[k].type]) $scope.variantCounts[gai[k].type] = 0;
      $scope.variantCounts[gai[k].type]++;

    });

    return output;
  };
  $scope.geneVariants = processVariants(gai);

  $scope.mutationBurdenFilter = (input) => {
    return (input == "nan [nan]") ? 'na' : input.replace(/\[[0-9]*\]/g, '');
  };


}]);