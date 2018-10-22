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
        microbial: (microbial !== null) ? microbial : { species: 'None', integrationSite: 'None' },
      };
      $scope.mutationSignature = mutationSignature;
      $scope.mutationMask = null;
      $scope.variantCounts = {
        cnv: 0,
        smallMutation: 0,
        expressionOutlier: 0,
        structuralVariant: 0,
      };

      $scope.toMutations = () => {
        $state.go('^.somaticMutations');
      };

      const variantCategory = (variant) => {
        // Small Mutations
        if (variant.geneVariant.match(/([A-z0-9]*)\s(\([pcg]\.[A-z]*[0-9]*[A-z_0-9>]*\*?\))/g)) {
          variant.type = 'smallMutation';
          return variant;
        }

        // Structural Variants
        if (variant.geneVariant.match(/(([A-z0-9]*|\?)::([A-z0-9]*|\?)\s\(e([0-9]*|\?):e([0-9]*|\?)\))/g)) {
          variant.type = 'structuralVariant';
          return variant;
        }

        // Expression Outliers
        if (variant.geneVariant.toLowerCase().indexOf('expression') !== -1) {
          variant.type = 'expressionOutlier';
          return variant;
        }

        // Return CNV mutation
        variant.type = 'cnv';
        return variant;
      };

      // Process variants and create chunks
      const processVariants = (variants) => {
        const output = [];

        // Reset counts
        $scope.variantCounts = {
          cnv: 0,
          smallMutation: 0,
          expressionOutlier: 0,
          structuralVariant: 0,
        };

        variants.forEach((variant, k) => {
          // Add processed Variant
          output.push(variantCategory(variant));

          // Update counts
          if (!$scope.variantCounts[gai[k].type]) $scope.variantCounts[gai[k].type] = 0;
          $scope.variantCounts[gai[k].type] += 1;
        });

        return output;
      };
      $scope.geneVariants = processVariants(gai);


      $scope.setMutationMask = (mask) => {
        if ($scope.mutationMask === mask) {
          $scope.mutationMask = null;
        } else {
          $scope.mutationMask = mask;
        }
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
              $mdDialog.cancel('Tumour analysis details were not updated');
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

              // Send updated entry to API
              $tumourAnalysis.update(pog.POGID, report.ident, scope.ta)
                .then(() => {
                  $mdDialog.hide('Tumour analysis details have been successfully updated');
                })
                .catch((error) => {
                  $mdToast.showSimple(`Tumour analysis details were not updated due to an error: ${error}`);
                });
            }; // End update
          }], // End controller

        })
          .then((outcome) => {
            if (outcome) $mdToast.showSimple(outcome);
          })
          .catch((error) => {
            $mdToast.showSimple(error);
          });
      }; // End edit tumour analysis


      // Update Mutation Signature Details
      $scope.updateMs = ($event) => {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/summary/mutationSignature.edit.html',
          clickOutToClose: false,
          controller: ['scope', (scope) => {
            scope.ta = angular.copy($scope.data.ta); //
            scope.mutationSignature = $scope.mutationSignature; // Array of all computed signal correlations

            scope.cancel = () => {
              $mdDialog.cancel('Mutation signature details were not updated');
            };

            scope.update = () => {
              // Send updated entry to API
              $tumourAnalysis.update($scope.pog.POGID, report.ident, scope.ta)
                .then(() => {
                  $mdDialog.hide({ message: 'Mutation signature details have been successfully updated', data: scope.ta });
                })
                .catch((error) => {
                  $mdToast.showSimple(`Mutation signature details were not updated due to an error: ${error}`);
                });
            }; // End update
          }], // End controller
        })
          .then((outcome) => {
            if (outcome) $mdToast.showSimple(outcome.message);
            $scope.data.ta = outcome.data;
          })
          .catch((error) => {
            $mdToast.showSimple(error);
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
              $mdDialog.cancel('Patient information was not updated');
            };


            scope.update = () => {
              // Send updated entry to API
              $patientInformation.update($scope.pog.POGID, scope.pi)
                .then(() => {
                  $mdDialog.hide({ message: 'Patient information has been successfully updated', data: scope.pi });
                })
                .catch((error) => {
                  $mdToast.showSimple(`Patient information was not updated due to an error: ${error}`);
                });
            }; // End update
          }], // End controller

        })
          .then((outcome) => {
            if (outcome) $mdToast.showSimple(outcome.message);
            $scope.data.pi = outcome.data;
          })
          .catch((error) => {
            $mdToast.showSimple(error);
          });
      }; // End edit tumour analysis


      $scope.data.gai = _.sortBy(gai, 'type');

      $scope.addAlteration = ($event) => {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/summary/alteration.add.html',
          clickOutToClose: false,
          controller: ['scope', (scope) => {
            scope.cancel = () => {
              $mdDialog.cancel('Alteration was not added');
            };

            // Perform Update/Change
            scope.add = () => {
              // Remove entry
              $gai.create(pog.POGID, report.ident, scope.alteration)
                .then((resp) => {
                  // Add to array of alterations
                  gai.push(resp);

                  // Reprocess variants
                  $scope.data.gai = processVariants(gai);
                  $scope.data.gai = _.sortBy(gai, 'type');

                  $mdDialog.hide({ status: true, message: 'Alteration has been successfully added' });
                })
                .catch((error) => {
                  $mdDialog.hide({ status: false, message: `Alteration was not added due to an error: ${error}` });
                });
            }; // End update
          }], // End controller
        })
          .then((outcome) => {
            if (outcome) $mdToast.showSimple(outcome.message);
          })
          .catch((error) => {
            $mdToast.showSimple(error);
          });
      };

      $scope.removeAlteration = ($event, alteration) => {
        const tempAlteration = angular.copy(alteration);

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/summary/alteration.remove.html',
          clickOutToClose: false,
          controller: ['scope', (scope) => {
            scope.alteration = alteration;

            scope.cancel = () => {
              $mdDialog.cancel('Alteration was not removed');
            };

            // Perform Update/Change
            scope.update = (cascade) => {
              // Remove entry
              $gai.remove(pog.POGID, report.ident, alteration.ident, scope.comment, cascade)
                .then(() => {
                  $scope.data.gai = _.reject($scope.data.gai, (r) => { return (r.ident === alteration.ident); });
                  gai = _.reject(gai, (r) => { return (r.ident === alteration.ident); });


                  // Remove from Get
                  if (cascade) $scope.data.get = _.reject($scope.data.get, (e) => { return (e.genomicEvent === alteration.geneVariant); });

                  // Subtract count
                  $scope.variantCounts[tempAlteration.type] -= 1;

                  $mdDialog.hide({ status: true, message: `Successfully removed the ${cascade ? 'alterations' : 'alteration'}` });
                })
                .catch((error) => {
                  $mdDialog.hide({ status: true, message: `Unable to remove the ${cascade ? 'alterations' : 'alteration'} due to an error: ${error}` });
                });
            }; // End update
          }], // End controller

        })
          .then((outcome) => {
            if (outcome) $mdToast.showSimple(outcome.message);
          })
          .catch((error) => {
            $mdToast.showSimple(error);
          });
      };
    }]);
