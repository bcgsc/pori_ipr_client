app.controller('controller.dashboard.report.genomic.history',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'api.pogDataHistory', 'history', 'tags',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, $history, history, tags) => {

  $scope.history = history;
  $scope.history = _.sortBy($scope.history, 'createdAt').reverse();
  $scope.tags = tags;

  // Open history detail
  $scope.detail = ($event, entry) => {

    $history(pog.POGID, report.ident).detail(entry.ident).then(
      (details) => {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/history/history.detail.html',
          clickOutToClose: false,
          locals: {
            entry: entry,
            details: details,
            tags: tags,
            pog: pog
          },
          controller: 'controller.dashboard.report.genomic.history.detail'
        }).then(
          (result) => {

            // Revert!
            console.log('Hidden dialog', event);
            if(result.event === 'revert') {
              $scope.history = _.concat(result.data, $scope.history);
              $mdToast.show($mdToast.simple().textContent('The history event has been reverted'));
            }

            // Removal
            if(result.event === 'restore') {
              // Find and remove the entry from history
              $scope.history = _.filter($scope.history, (h) => { return (h.ident !== result.data.ident) });
              $mdToast.show($mdToast.simple().textContent('The history event has been restored'));
            }
          },
          (err) => {
            console.log('Canceled dialog', err);
          }
        );
      },
      (err) => {
        console.log('Unable to load details');
      }
    );

  }

}]);
