app.controller('controller.dashboard.report.genomic.smallMutations',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'api.vardb', 'pog', 'report', 'ms', 'images', 'smallMutations', 'mutationSignature',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, $vardb, pog, report, ms, images, smallMutations, mutationSignature) => {

  // Load Images into template
  $scope.images = images;
  $scope.pog = pog;
  $scope.report = report;
  $scope.smallMutations = {};
  $scope.mutationSignature = mutationSignature;
  $scope.ms = ms;

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

}]);
