app.controller('controller.print.POG.report.genomic.somaticMutations',
['_', '$scope', '$sce', 'pog', 'report', 'images', 'ms', 'smallMutations', 'mutationSignature',
(_, $scope, $sce, pog, report, images, ms, smallMutations, mutationSignature) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.smallMutations = {};
  $scope.mutationSignature = [];
  $scope.nnlsNormal = false;
  $scope.ms = ms;

  $scope.copyFilter = (copyChange) => {
    return copyChange.match(/(((\+|\-)?)[0-9]{1,2})/g)[0];
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

}]);