app.directive("iprMutationSignature", ['$q', '_', '$mdDialog', '$mdToast', ($q, _, $mdDialog, $mdToast) => {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      pog: '=pog',
      report: '=report',
      mutationSummary: '=mutationSummary',
      mutationSignature: '=mutationSignature',
      mode: '=?mode' // Either normal or editor
    },
    templateUrl: 'ipr-mutation-landscape/ipr-mutation-landscape.html',
    link: (scope, element, attr) => {

      scope.nnlsNormal = false;
      scope.mutationSort = {col: "signature", order: true};
      scope.selectedSigs = [];
      scope.modifier = {};

      if(!scope.mode) scope.mode = 'normal';

      let ms = scope.mutationSummary;
      let mutationSignature = angular.copy(scope.mutationSignature);

      // If mode is pick, preload selected sigs:
      if(scope.mode === 'pick') {
        _.forEach(ms.mutationSignature, (v) => {
          scope.selectedSigs.push(v.ident);
          scope.modifier[v.ident] = v.modifier;
        });
      }

      // For pick mode, adds to selected Sigs
      scope.addToSelection = (signature) => {

        // Check if it's currently selected
        let seek = (scope.selectedSigs.indexOf(signature.ident) > -1);

        // Remove from Selected Signatures
        if(seek) _.pull(scope.selectedSigs, signature.ident);

        // Add to selected Signatures
        if(!seek) scope.selectedSigs.push(signature.ident);

        scope.updateSelectedSigs();

      };

      // Rebuild Selected Signatures
      scope.updateSelectedSigs = () => {

        scope.mutationSummary.mutationSignature = [];

        // Rebuild!
        _.forEach(scope.selectedSigs, (s) => {

          let seek = _.find(mutationSignature, {ident: s});

          console.log('Found a selected entry', seek);

          // Found a seek
          if(seek) {
            // Check for modifier
            if(scope.modifier[seek.ident]) seek.modifier = scope.modifier[seek.ident];
            scope.mutationSummary.mutationSignature.push(seek);
          }

        });

      };

      scope.sortMutations = (col) => {
        // Is this a valid column?
        if(['signature', 'nnls', 'pearson'].indexOf(col) === -1) return false;

        if(scope.mutationSort.col === col) {
          scope.mutationSort.order = !scope.mutationSort.order;

        } else {
          scope.mutationSort.col = col;
          scope.mutationSort.order = true;
        }

        processSignature(angular.copy(mutationSignature));
      };

      // Check if the current mutation is a selected one.
      scope.isSelectedMutation = (ident) => {
        let found = _.find(scope.mutationSummary.mutationSignature, (m) => {
          return m.ident === ident;
        });
        return found !== undefined;
      };

      scope.toggleNnlsNormalize = () => {
        scope.nnlsNormal = !scope.nnlsNormal;
        processSignature(angular.copy(mutationSignature));
      };

      let processSignature = (sigs) => {
        scope.mutationSignature = [];
        let nnlsMax = (scope.nnlsNormal) ? 0 : 1;

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

          scope.mutationSignature.push(r);

        });
        scope.mutationSignature = _.sortBy(scope.mutationSignature, scope.mutationSort.col);
        if(!scope.mutationSort.order) scope.mutationSignature.reverse();``
      };

      processSignature(angular.copy(mutationSignature));

    } // end link
  }; // end return

}]);
