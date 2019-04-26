app.controller('controller.dashboard.report.probe.meta',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.pog_analysis_report', 'pog', 'report', 'indefiniteArticleFilter',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $report, pog, report, indefiniteArticleFilter) => {
      $scope.pog = pog;
      $scope.roles = ['bioinformatician', 'analyst', 'reviewer', 'admin', 'clinician'];
      $scope.report = report;
      $scope.reportSettingsChanged = false;

      let reportCache = angular.copy(report);

      // Unbind user
      const removeEntry = (role) => {
        $report.unbindUser($scope.report.ident, role.user.ident, role.role).then(
          (result) => {
            // Find and remove the ident!
            $scope.report = result;
            report = result;
          },
          (err) => {
            $mdToast.show($mdToast.simple().textContent('Failed to unbind user.'));
          },
        );
      };

      $scope.remove = () => {
        return removeEntry;
      };

      $scope.roleFilter = (filter) => {
        return (puser) => {
          return (puser.role === filter);
        };
      };

      // Update Patient Information
      $scope.addUser = ($event, suggestedRole) => {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/meta/role.add.html',
          clickOutToClose: false,
          controller: ['scope', 'api.user', (scope, $user) => {

            scope.role = { role: suggestedRole };

            scope.cancel = () => {
              $mdDialog.cancel();
            };

            scope.searchUsers = (searchText) => {
              const deferred = $q.defer();

              if (searchText.length === 0) {
                return [];
              }

              $user.search(searchText).then(
                (resp) => {
                  deferred.resolve(resp);
                },
                (err) => {
                  console.log(err);
                  deferred.reject();
                },
              );

              return deferred.promise;
            };

            scope.add = (f) => {
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

              // Perform binding
              $report.bindUser($scope.report.ident, scope.role.user.ident, scope.role.role).then(
                (resp) => {
                  $mdDialog.hide({ data: resp, message: scope.role.user.firstName + ' ' + scope.role.user.lastName + ' has been added as ' + indefiniteArticleFilter(scope.role.role) + ' ' + scope.role.role});
                },
                (err) => {
                  console.log('Binding error', err);
                },
              );
            };
          }],
        }).then(
          (outcome) => {
            if (outcome) {
              $mdToast.show($mdToast.simple().textContent(outcome.message));
              $scope.report = outcome.data;
              report = outcome.data;
            }
          },
          (error) => {
            $mdToast.show($mdToast.simple().textContent('No changes were made'));
          },
        );
      };

      $scope.checkChange = () => {
        if ($scope.report.type !== reportCache.type) {
          $scope.reportSettingsChanged = true;
        }
        if ($scope.report.state !== reportCache.state) {
          $scope.reportSettingsChanged = true;
        }
        if ($scope.report.reportVersion !== reportCache.reportVersion) {
          $scope.reportSettingsChanged = true;
        }
        if ($scope.report.kbVersion !== reportCache.kbVersion) {
          $scope.reportSettingsChanged = true;
        }
        if ($scope.reportSettingsChanged
          && JSON.stringify($scope.report) === JSON.stringify(reportCache)
        ) {
          $scope.reportSettingsChanged = false;
        }
      };

      $scope.updateSettings = () => {
        $scope.reportSettingsChanged = false;

        // Send updated settings to API
        $report.update($scope.report).then(
          (result) => {
            // Report successfully updated
            $scope.report = result;
            reportCache = angular.copy(result);

            $mdToast.show($mdToast.simple().textContent('Report settings have been updated.'));
          },
          (err) => {
            // Failed to update, restore from cache.
            $scope.report = angular.copy(reportCache);
            $mdToast.show($mdToast.simple().textContent('The report settings could not be updated.'));
          },
        );
      };
    }]);
