app.controller('controller.print.POG.report.genomic.structuralVariants',
['_', '$scope', '$sce', 'pog', 'report', 'images', 'ms', 'svs',
(_, $scope, $sce, pog, report, images, ms, svs) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.ms = ms;
  $scope.allVariants = [];

  $scope.titleMap = {
    clinical: 'Gene Fusions of Potential Clinical Relevance with Genome & Transcriptome Support',
    nostic: 'Gene Fusions of Prognostic and Diagnostic Relevance',
    biological: 'Gene Fusions with Biological Relevance',
    fusionOmicSupport: 'Gene Fusions with Genome and Transcriptome Support'
  };

  let processSvs = (structVars) => {

    let svs = {
      clinical: [],
      nostic: [],
      biological: [],
      fusionOmicSupport: []
    };

    // Run over mutations and group
    _.forEach(structVars, (row, k) => {
      if(!(row.svVariant in svs)) svs[row.svVariant] = [];
      row.breakpoint = _.join(row.breakpoint.split('|'), '| ');
      // Add to type
      svs[row.svVariant].push(row);

      row.svg = $sce.trustAsHtml(row.svg);
      $scope.allVariants.push(row);
    });

    // Set Small Mutations
    $scope.StrucVars = svs;
  };

  processSvs(svs);

}]);