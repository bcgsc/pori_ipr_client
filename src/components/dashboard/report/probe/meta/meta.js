app.controller('controller.dashboard.report.probe.meta',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.pog_analysis_report', 'pog', 'report',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $report, pog, report) => {

  $scope.pog = pog;
  $scope.report = report;
  $scope.reportSettingsChanged = false;

  let reportCache = angular.copy(report);

  $scope.checkChange = () => {

    if($scope.report.type !== reportCache.type) $scope.reportSettingsChanged = true;
    if($scope.report.state !== reportCache.state) $scope.reportSettingsChanged = true;
    if($scope.report.reportVersion !== reportCache.reportVersion) $scope.reportSettingsChanged = true;
    if($scope.report.kbVersion !== reportCache.kbVersion) $scope.reportSettingsChanged = true;

    if($scope.reportSettingsChanged && JSON.stringify($scope.report) === JSON.stringify(reportCache)) {
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
      }
    )

  }


}]);
