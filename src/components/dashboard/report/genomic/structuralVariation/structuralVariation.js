app.controller('controller.dashboard.report.genomic.structuralVariation',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'images', 'svs', 'ms',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, images, svs, ms) => {

      // Load Images into template
      $scope.images = images;
      $scope.pog = pog;
      $scope.report = report;
      $scope.ms = ms;
      $scope.StrucVars = {};

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
          // Add to type
          svs[row.svVariant].push(row);
        });

        // Set Small Mutations
        $scope.StrucVars = svs;
      };

      processSvs(svs);

    }
  ]
);
