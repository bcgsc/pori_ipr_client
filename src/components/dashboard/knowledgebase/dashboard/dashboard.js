app.controller('knowledgebase.dashboard', ['$q', '$scope', '$timeout', '$state', 'metrics', ($q, $scope, $timeout, $state, metrics) => {

  $scope.metrics = metrics;

  $scope.search = {
    target: 'references',
    query: null,
    go: null
  };

  $scope.totals = {
    ref: parseInt(metrics.refTotal).toLocaleString(),
    ev: parseInt(metrics.evTotal).toLocaleString()
  };

  $scope.doughnut = {};
  $scope.doughnut.events = {
    data: [0,0,0,0],
    labels: [
      'Approved', 'New', 'Flagged-Incorrect', 'Requires-Review'
    ],
    colors: [
      '#2ECC71',
      '#19B5FE',
      '#F22613',
      '#F9BF3B'

    ],
    options: {
      legend: {
        display: true,
        position: 'left'
      }
    }
  };

  $scope.doughnut.references = {
    data: [0,0,0,0],
    labels: [
      'Reviewed', 'New', 'Flagged-Incorrect', 'Requires-Review', 'Interim'
    ],
    colors: [
      '#2ECC71',
      '#19B5FE',
      '#F22613',
      '#F9BF3B',
      '#c104f9',

    ],
    options: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  $timeout(() => {
    $scope.doughnut.events.data = [
      metrics.evApproved,
      metrics.evNew,
      metrics.evFlaggedIncorrect,
      metrics.evRequiresReview
    ];
  }, 500);

  $timeout(() => {
    $scope.doughnut.references.data = [
      metrics.refReviewed,
      metrics.refNew,
      metrics.refFlaggedIncorrect,
      metrics.refRequiresReview,
      metrics.refInterim
    ];
  },300);


  $scope.search.go = () => {

    // Send to correct page with search criteria
    if($scope.search.target === 'references') $state.go('dashboard.knowledgebase.references', {filters: {search: $scope.search.query}});
    if($scope.search.target === 'events') $state.go('dashboard.knowledgebase.events', {filters: {search: $scope.search.query}});

  }

}]);