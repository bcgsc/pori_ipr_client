app.directive("iprSmallMutations", ['$q', '_', '$mdDialog', ($q, _, $mdDialog) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      mutations: '=mutations',
      pog: '=pog',
      report: '=report'
    },
    templateUrl: 'ipr-smallMutations/ipr-smallMutations.html',
    link: (scope, element, attr) => {

      scope.copyFilter = (copyChange) => {
        let copyChangeDisplay = (copyChange == 'na') ? 'na' : copyChange.match(/(((\+|\-)?)[0-9]{1,2})/g)[0];
        return copyChangeDisplay;
      };


      scope.vardbVarLib = ($event, mutation) => {

        let variant = {
          chromosome: mutation.location.split(':')[0],
          position: mutation.location.split(':')[1],
          ref: mutation.refAlt.split('>')[0],
          alt: mutation.refAlt.split('>')[1],
        };

        // Prepare mutation for VarDB Lookup=
        $mdDialog.show({
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: {
            variant: variant,
            mutation: mutation
          },
          templateUrl: 'ipr-smallMutations/vardb-libraries.html',
          controller: ['scope', '$mdDialog', '$timeout', 'api.vardb', 'variant', 'mutation', ($scope, $mdDialog, $timeout, $vardb, variant, mutation) => {

            $scope.libraries = [];
            $scope.loading = true;
            $scope.mutation = mutation;
            $scope.step = 0;

            // Find libraries with alternate base
            $vardb.variantLibraries(variant.chromosome, variant.position, variant.ref, variant.alt).then(
              (vardbLibs) => {
                // Create response object
                let response = {
                  libraries: [],
                  total: vardbLibs.total_pog_libraries
                };

                $scope.step = 1;
                $timeout(() => { $scope.step = 2}, 1000);

                // Get Library Meta Data
                $vardb.libraryMeta(vardbLibs.libraries).then(
                  (meta) => {
                    response.libraries = meta;

                    $scope.loading = false;
                    $scope.libraries = response.libraries;

                    console.log('Libraries', $scope.libraries);
                    console.log('libraries', vardbLibs);


                  },
                  (err) => {
                    console.log('Unable to get POG libraries', err);
                  }
                )

              },
              (err) => {
                console.log('Unable to get libaries with variant', err);
              }
            );


            $scope.cancel = () => {
              $mdDialog.hide();
            };

          }]
        });
      };

    } // end link
  } // end return

}]);
