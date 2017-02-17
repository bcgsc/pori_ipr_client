app.controller('controller.dashboard.report.genomic.somaticMutations',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'pog', 'ms', 'images', 'smallMutations', 'mutationSignature',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, pog, ms, images, smallMutations, mutationSignature) => {

      // Load Images into template
      $scope.images = images;
      $scope.pog = pog;
      $scope.smallMutations = {};
      $scope.mutationSignature = [];

      let processSignature = (sigs) => {

        _.forEach(sigs, (r, k) => {

          // Round to 3 sigfigs
          r.pearson = r.pearson.toFixed(3);
          r.nnls = r.nnls.toFixed(3);

          // Produced rounded numbers
          r.pearsonColour = Math.round((((r.pearson < 0) ? 0 : r.pearson)  * 100) / 5) * 5;
          r.nnlsColour = Math.round((r.nnls * 100) / 5) * 5;

          $scope.mutationSignature.push(r);

        });

      };

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
      processSignature(mutationSignature);

    }
  ]
);
