app.controller('controller.dashboard.report.genomic.history',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'api.pogDataHistory', 'history', 'tags',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, $history, history, tags) => {

  $scope.history = history;
  $scope.tags = tags;

  $scope.detail = ($event, entry) => {

    $history(pog.POGID).detail(entry.ident).then(
      (details) => {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/history/history.detail.html',
          clickOutToClose: false,
          locals: {
            entry: entry,
            details: details,
            tags: tags
          },
          controller: 'controller.dashboard.report.genomic.history.detail'
        })
      },
      (err) => {
        console.log('Unable to load details');
      }
    );

  }

}]);
