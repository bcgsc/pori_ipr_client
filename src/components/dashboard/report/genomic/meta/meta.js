app.controller('controller.dashboard.report.genomic.meta',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'indefiniteArticleFilter',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, indefiniteArticleFilter) => {

      $scope.pog = pog;

      $scope.roles = ['bioinformatician','analyst','reviewer','admin', 'clinician'];

      // Remove an entry
      let removeEntry = (role) => {

        let deferred = $q.defer();

        $pog.user(pog.POGID).unbind(role.user.ident, role.role).then(
          (result) => {

            // Find and remove the ident!
            $scope.pog.POGUsers = _.filter($scope.pog.POGUsers, (r) => {return (r.ident !== role.ident)});
          },
          (err) => {

          }
        );

        return deferred.promise;

      };

      //
      $scope.remove = () => {
        return removeEntry;
      };

      $scope.roleFilter = (filter) => {
        return (puser) => {
          return (puser.role == filter);
        }
      };

      // Update Patient Information
      $scope.addUser = ($event, suggestedRole) => {

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/meta/role.add.html',
          clickOutToClose: false,
          controller: ['scope', 'api.user', (scope, $user) => {

            scope.role = {role: suggestedRole};

            scope.cancel = () => {
              $mdDialog.cancel();
            };

            scope.searchUsers = (searchText) => {
              let deferred = $q.defer();

              if(searchText.length === 0) return [];

              $user.search(searchText).then(
                (resp) => {
                  deferred.resolve(resp);
                },
                (err) => {
                  console.log(err);
                  deferred.reject();
                }
              );

              return deferred.promise;
            };

            scope.add = (f) => {

              // Check for valid inputs by touching each entry
              if(f.$invalid) {
                f.$setDirty();
                angular.forEach(f.$error, (field) => {
                  angular.forEach(field, (errorField) => {
                    errorField.$setTouched();
                  });
                });
                return;
              }

              // Remap user obj to ident
              $pog.user(pog.POGID).bind(scope.role.user.ident, scope.role.role).then(
                (resp) => {
                  $mdDialog.hide({data: resp, message: resp.user.firstName + ' ' + resp.user.lastName + ' has been added as ' + indefiniteArticleFilter(resp.role) + ' ' + resp.role});
                },
                (err) => {
                  console.log('Binding error', err);
                }
              );
            }; // end Add

          }] // End controller

        }).then((outcome) => {
          if (outcome) $mdToast.show($mdToast.simple().textContent(outcome.message));
          $scope.pog.POGUsers.push(outcome.data);
        }, (error) => {
          $mdToast.show($mdToast.simple().textContent('No changes were made'));
        });

      }; // End edit tumour analysis

    }
  ]
);
