app.controller('controller.dashboard.report.genomic.somaticMutations',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'pog', 'ms', 'images', 'smallMutations',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, pog, ms, images, smallMutations) => {

      // Load Images into template
      $scope.images = images;
      $scope.pog = pog;
      $scope.smallMutations = {};

      let processMutations = (muts) => {

        let mutations = {
          clinical: [],
          nostic: [],
          biological: [],
          unknown: []
        };

        // Run over mutations and group
        _.forEach(muts, (row, k) => {
          if(!(row.mutationType in mutations)) mutations[row.mutationType] = [];
          // Add to type
          mutations[row.mutationType].push(row);
        });

        // Set Small Mutations
        $scope.smallMutations = mutations;
      };

      processMutations(smallMutations);

    }
  ]
);
