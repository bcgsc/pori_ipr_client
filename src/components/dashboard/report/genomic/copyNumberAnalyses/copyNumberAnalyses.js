app.controller('controller.dashboard.report.genomic.copyNumberAnalyses',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'pog', 'report', 'ms', 'images', 'cnvs',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, pog, report, ms, images, cnvs) => {

      // Load Images into template
      $scope.images = images;
      $scope.pog = pog;
      $scope.report = report;
      $scope.cnvGroups = {};


      $scope.titleMap = {
        clinical: 'CNVs of Potential Clinical Relevance',
        nostic: 'CNVs of Prognostic or Diagnostic Relevance',
        biological: 'CNVs of Biological Relevance',
        commonAmplified: 'Amplified Oncogenes',
        homodTumourSupress: 'Homozygously Deleted Tumour Suppresors',
        highlyExpOncoGain: 'Highly Expressed Oncogenes with Copy Gains',
        lowlyExpTSloss: 'Lowly Expressed Tumour Suppressors with Copy Losses'
      };

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


    }
  ]
);
