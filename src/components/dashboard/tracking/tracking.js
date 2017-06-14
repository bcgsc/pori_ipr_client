app.controller('controller.dashboard.tracking',
['$q', '_', '$scope', 'api.tracking.definition', 'api.tracking.state', 'api.tracking.task', '$mdDialog', '$mdToast', 'states', 'definitions',
($q, _, $scope, $definition, $state, $task, $mdDialog, $mdToast, states, definitions) => {

  console.log('States', states);
  console.log('Definitions', definitions);

  $scope.definitions = definitions;
  $scope.sortedStates = {};
  // Sort States

  let sortStates = (statsInput) => {

    _.forEach(statsInput, (s) => {

      if(!$scope.sortedStates[s.slug]) $scope.sortedStates[s.slug] = [];

      $scope.sortedStates[s.slug].push(s);

    });

  };

  sortStates(states);

  console.log('Sorted states', $scope.sortedStates);

}]);