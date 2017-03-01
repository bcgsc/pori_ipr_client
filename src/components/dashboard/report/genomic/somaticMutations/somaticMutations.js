app.controller('controller.dashboard.report.genomic.somaticMutations',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'pog', 'ms', 'images', 'smallMutations', 'mutationSignature',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, pog, ms, images, smallMutations, mutationSignature) => {

      // Load Images into template
      $scope.images = images;
      $scope.pog = pog;
      $scope.smallMutations = {};
      $scope.mutationSignature = [];
      $scope.nnlsNormal = true;
      $scope.mutationSort = {col: "signature", order: true};

      $scope.sortMutations = (col) => {
        // Is this a valid column?
        if(['signature', 'nnls', 'pearson'].indexOf(col) === -1) return false;

        if($scope.mutationSort.col === col) {
          $scope.mutationSort.order = !$scope.mutationSort.order;

        } else {
          $scope.mutationSort.col = col;
          $scope.mutationSort.order = true;
        }

        processSignature(angular.copy(mutationSignature));
      };

      // Check if the current mutation is a selected one.
      $scope.isSelectedMutation = (ident) => {
        let found = _.find(ms.mutationSignature, (m) => {
          return m.ident == ident;
        });

        return found !== undefined;
      };

      $scope.toggleNnlsNormalize = () => {
        $scope.nnlsNormal = !$scope.nnlsNormal;
        console.log('nnls Normal bool', $scope.nnlsNormal);

        processSignature(angular.copy(mutationSignature));
      };


      let processSignature = (sigs) => {
        $scope.mutationSignature = [];
        let nnlsMax = ($scope.nnlsNormal) ? 0 : 1;

        _.forEach(sigs, (r, k) => {
          if(r.nnls > nnlsMax) nnlsMax = r.nnls;
        });

        _.forEach(sigs, (r, k) => {

          // Round to 3 sigfigs
          r.pearson = r.pearson.toFixed(3);
          r.nnls = r.nnls.toFixed(3);

          // Produced rounded numbers
          r.pearsonColour = Math.round((((r.pearson < 0) ? 0 : r.pearson)  * 100) / 5) * 5;
          r.nnlsColour = Math.round(((r.nnls/nnlsMax) * 100) / 5) * 5;

          $scope.mutationSignature.push(r);

        });

        $scope.mutationSignature = _.sortBy($scope.mutationSignature, $scope.mutationSort.col);
        if(!$scope.mutationSort.order) $scope.mutationSignature.reverse();

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
      processSignature(angular.copy(mutationSignature));

    }
  ]
);
