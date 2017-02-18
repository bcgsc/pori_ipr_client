app.controller('controller.dashboard.report.genomic.summary', 
  ['_', '$q', '$state', '$scope', 'api.pog', 'api.summary.tumourAnalysis', 'api.summary.mutationSummary', '$mdDialog', '$mdToast', 'pog', 'gai', 'get', 'ms', 'vc', 'pt', 'mutationSignature',
  (_, $q, $state, $scope, $pog, $tumourAnalysis, $mutationSummary, $mdDialog, $mdToast, pog, gai, get, ms, vc, pt, mutationSignature) => {
  
  console.log('Loaded dashboard genomic report summary controller');
  
  $scope.pog = pog;
  $scope.data = {
    get: get,
    ms: ms,
    vc: vc,
    pt: pt,
    ta: pog.tumourAnalysis,
    pi: pog.patientInformation
  };
  $scope.geneVariants = [];
  $scope.mutationSignature = mutationSignature;

  $scope.toMutations = () => { $state.go('^.somaticMutations'); };

  let variantCategory = (variant) => {
    let cnvs = ['copy gain','copy loss', 'amplification', 'Homozygous Loss', 'Homozygous Gain'];
    
    // Small Mutations
    if(variant.geneVariant.match(/([A-z0-9]*)\s(\(\p\.[A-z]*[0-9]*[A-z]*\))/g)) {
      variant.type = "smallMutation";
      return variant;
    }
    
    // Structural Variants
    if(variant.geneVariant.match(/([A-z0-9]*\:\:[A-z0-9]*\s\(\e([0-9]*|\?)\:\e([0-9]*|\?)\))/g)) {
      variant.type = "structuralVariant";
      return variant;
    }
    
    // Expression Outliers
    if(variant.geneVariant.toLowerCase().indexOf('expression') !== -1) {
      variant.type = "expressionOutlier";
      return variant;
    }
    
    // Return CNV mutation
    variant.type = "cnv";
    return variant;
    
  };
  
  // Process variants and create chunks
  gai.forEach((variant, k) => {
    gai[k] = variantCategory(variant);
  });

  // Update Tumour Analysis Details
  $scope.updateTa = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/tumourAnalysis.edit.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {

        scope.ta = $scope.data.ta;

        scope.cancel = () => {
          $mdDialog.cancel('No changes were saved.');
        }

        scope.update = (f) => {
          // Check for valid inputs by touching each entry
          if (f.$invalid) {
            f.$setDirty();
            angular.forEach(f.$error, (field) => {
              angular.forEach(field, (errorField) => {
                errorField.$setTouched();
              });
            });
            return;
          }

          console.log($tumourAnalysis);

          // Send updated entry to API
          $tumourAnalysis.update($scope.pog.POGID, scope.ta).then(
            (result) => {
              $mdDialog.hide('Entry has been updated');
            },
            (error) => {
              alert('Unable to update. See console');
              console.log(error);
            }
          );
        }// End update
      }] // End controller

    }).then((outcome) => {
      if(outcome) $mdToast.show($mdToast.simple().textContent(outcome));
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });

  }; // End edit tumour analysis



  // Update Tumour Analysis Details
  $scope.updateMs = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/mutationSignature.edit.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {

        scope.ms = angular.copy($scope.data.ms); //
        scope.mutationSignature = []; // Array of all computed signal correlations
        scope.selectedSigs = []; // Model for selected signatures

        // prepare fresh selection form
        _.forEach($scope.data.ms.mutationSignature, (v) => {
          scope.selectedSigs.push(v.ident);
        });

        // Process mutation signatures to include class name based rounded number and 3 sigfig values
        let processSignature = (sigs) => {
          _.forEach(sigs, (r, k) => {
            // Round to 3 sigfigs
            r.pearson = r.pearson.toFixed(3);
            r.nnls = r.nnls.toFixed(3);
            // Produced rounded numbers
            r.pearsonColour = Math.round((((r.pearson < 0) ? 0 : r.pearson)  * 100) / 5) * 5;
            r.nnlsColour = Math.round((r.nnls * 100) / 5) * 5;
            scope.mutationSignature.push(r);
          });

        };
        processSignature(angular.copy($scope.mutationSignature));

        scope.addToSelection = (ident) => {

          if(scope.selectedSigs.indexOf(ident) > -1) {
            _.pull(scope.selectedSigs, ident)
          } else {
            scope.selectedSigs.push(ident);
          }
        };

        scope.cancel = () => {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = () => {
          scope.ms.mutationSignature = [];
          // Interpret values
          _.forEach(scope.selectedSigs, (v) => {

            let sig = _.find($scope.mutationSignature, (s) => {
              return s.ident == v;
            })

            scope.ms.mutationSignature.push(sig);

          });

          // Send updated entry to API
          $mutationSummary.update($scope.pog.POGID, scope.ms).then(
            (result) => {
              $mdDialog.hide({message: 'Entry has been updated', data: scope.ms});
            },
            (error) => {
              alert('Unable to update. See console');
              console.log(error);
            }
          );

        }// End update
      }] // End controller

    }).then((outcome) => {
      if(outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.data.ms = outcome.data;
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });

  }; // End edit tumour analysis





  $scope.data.gai = _.sortBy(gai, 'type');
  
  $scope.mutationBurdenFilter = (input) => {
    return (input == "nan [nan]") ? 'na' : input.replace(/\[[0-9]*\]/g, '');
  }

}]);
