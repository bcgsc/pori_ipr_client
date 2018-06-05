app.controller('controller.dashboard.report.genomic.summary',
['_', '$q', '$state', '$scope', 'api.pog', 'api.summary.tumourAnalysis', 'api.summary.patientInformation', 'api.summary.mutationSummary', 'api.summary.genomicAterationsIdentified', '$mdDialog', '$mdToast', 'pog', 'report', 'gai', 'get', 'ms', 'pt', 'vc', 'mutationSignature', 'microbial',
(_, $q, $state, $scope, $pog, $tumourAnalysis, $patientInformation, $mutationSummary, $gai, $mdDialog, $mdToast, pog, report, gai, get, ms, pt, vc, mutationSignature, microbial) => {

  // Determine which interpreted prevalence value will be displayed
  ms.snvPercentileCategory = (report.tumourAnalysis.diseaseExpressionComparator === 'average') ? ms.snvPercentileTCGACategory : ms.snvPercentileDiseaseCategory;
  ms.indelPercentileCategory = (report.tumourAnalysis.diseaseExpressionComparator === 'average') ? ms.indelPercentileTCGACategory : ms.indelPercentileDiseaseCategory;

  $scope.pog = pog;
  $scope.report = report;
  $scope.data = {
    get: get,
    ms: ms,
    vc: vc,
    pt: pt,
    ta: report.tumourAnalysis,
    pi: report.patientInformation,
    microbial: (microbial !== null) ? microbial : {species: "None", integrationSite: "None"}
  };
  $scope.mutationSignature = mutationSignature;
  $scope.mutationMask = null;
  $scope.variantCounts = {
    cnv: 0,
    smallMutation: 0,
    expressionOutlier: 0,
    structuralVariant: 0
  };

  $scope.toMutations = () => {
    $state.go('^.somaticMutations');
  };

  let variantCategory = (variant) => {
    let cnvs = ['copy gain', 'copy loss', 'amplification', 'Homozygous Loss', 'Homozygous Gain'];

    // Small Mutations
    if (variant.geneVariant.match(/([A-z0-9]*)\s(\(\p\.[A-z]*[0-9]*[A-z_0-9]*\*?\))/g)) {
      variant.type = "smallMutation";
      return variant;
    }

    // Structural Variants
    if (variant.geneVariant.match(/(([A-z0-9]*|\?)\:\:([A-z0-9]*|\?)\s\(\e([0-9]*|\?)\:\e([0-9]*|\?)\))/g)) {
      variant.type = "structuralVariant";
      return variant;
    }

    // Expression Outliers
    if (variant.geneVariant.toLowerCase().indexOf('expression') !== -1) {
      variant.type = "expressionOutlier";
      return variant;
    }

    // Return CNV mutation
    variant.type = "cnv";
    return variant;

  };

  // Process variants and create chunks
  let processVariants = (variants) => {

    let output = [];

    // Reset counts
    $scope.variantCounts = { cnv: 0, smallMutation: 0, expressionOutlier: 0, structuralVariant: 0 };

    variants.forEach((variant, k) => {
      // Add processed Variant
      output.push(variantCategory(variant));

      // Update counts
      if (!$scope.variantCounts[gai[k].type]) $scope.variantCounts[gai[k].type] = 0;
      $scope.variantCounts[gai[k].type]++;

    });

    return output;
  };
  $scope.geneVariants = processVariants(gai);


  $scope.setMutationMask = (mask) => {
    if($scope.mutationMask === mask) return $scope.mutationMask = null;
    $scope.mutationMask = mask;
  };

  $scope.mutationFilter = (mutation) => {
    return (mutation.type === $scope.mutationMask || $scope.mutationMask === null);
  };

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
        };

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
          $tumourAnalysis.update(pog.POGID, report.ident, scope.ta).then(
            (result) => {
              $mdDialog.hide('Entry has been updated');
            },
            (error) => {
              alert('Unable to update. See console');
              console.log(error);
            }
          );
        }; // End update
      }] // End controller

    }).then((outcome) => {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome));
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

        scope.ta = angular.copy($scope.data.ta); //
        scope.mutationSignature = $scope.mutationSignature; // Array of all computed signal correlations

        scope.cancel = () => {
          $mdDialog.cancel('No changes were saved.');
        };

        scope.update = () => {

          // Send updated entry to API
          $tumourAnalysis.update($scope.pog.POGID, report.ident, scope.ta).then(
            (result) => {
              $mdDialog.hide({message: 'Entry has been updated', data: scope.ta});
            },
            (error) => {
              alert('Unable to update. See console');
              console.log(error);
            }
          );

        }; // End update
      }] // End controller

    }).then((outcome) => {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.data.ta = outcome.data;
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });

  }; // End edit tumour analysis

  // Update Patient Information
  $scope.updatePatient = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/patientInformation.edit.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {

        scope.pi = angular.copy($scope.data.pi); //

        scope.cancel = () => {
          $mdDialog.cancel('No changes were saved.');
        };


        scope.update = () => {

          // Send updated entry to API
          $patientInformation.update($scope.pog.POGID, scope.pi).then(
            (result) => {
              $mdDialog.hide({message: 'Entry has been updated', data: scope.pi});
            },
            (error) => {
              alert('Unable to update. See console');
              console.log(error);
            }
          );

        }; // End update
      }] // End controller

    }).then((outcome) => {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
      $scope.data.pi = outcome.data;
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });

  }; // End edit tumour analysis


  $scope.data.gai = _.sortBy(gai, 'type');

  /**
   * Add Alteration
   */
  $scope.addAlteration = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/alteration.add.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {
        scope.cancel = () => {
          $mdDialog.cancel({message: 'No changes were saved.'});
        };

        // Perform Update/Change
        scope.add = () => {

          // Remove entry
          $gai.create(pog.POGID, report.ident, scope.alteration).then(
            (resp) => {
              // Add to array of alterations
              gai.push(resp);

              // Reprocess variants
              $scope.data.gai = processVariants(gai);
              $scope.data.gai = _.sortBy(gai, 'type');

              $mdDialog.hide({status: true, message: 'Added the new alteration.'});
            },
            (err) => {
              console.log('Unable to remove entries', err);
              $mdDialog.hide({status: false, message: 'Unable to create the new entry'});
            }
          );

        }; // End update
      }] // End controller

    }).then((outcome) => {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent('No changes where made.'));
    });

  };

  /**
   * Remove alteration and propagate into other sections
   *
   * @param $event
   * @param alteration
   */
  $scope.removeAlteration = function($event, alteration) {

    let tempAlteration = angular.copy(alteration);

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/summary/alteration.remove.html',
      clickOutToClose: false,
      controller: ['scope', (scope) => {
        scope.alteration = alteration;

        scope.cancel = () => {
          $mdDialog.cancel({message: 'No changes were saved.'});
        };

        // Perform Update/Change
        scope.update = (cascade) => {

          // Remove entry
          $gai.remove(pog.POGID, report.ident, alteration.ident, scope.comment, cascade).then(
            (resp) => {
              $scope.data.gai = _.reject($scope.data.gai, (r) => { return (r.ident === alteration.ident); });
              gai = _.reject(gai, (r) => { return (r.ident === alteration.ident); });


              // Remove from Get
              if(cascade) $scope.data.get = _.reject($scope.data.get, (e) => { return (e.genomicEvent === alteration.geneVariant); });

              // Subtract count
              $scope.variantCounts[tempAlteration.type]--;

              $mdDialog.hide({status: true, message: 'Successfully removed the '+ ((cascade) ? 'entries' : 'entry') + '.'});
            },
            (err) => {
              console.log('Unable to remove entries', err);
              $mdDialog.hide({status: true, message: 'Unable to remove the '+ ((cascade) ? 'entries' : 'entry') + '.'});
            }
          );

        }; // End update
      }] // End controller

    }).then((outcome) => {
      if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent('No changes where made.'));
    });

  };

}]);
