app.controller('knowledgebase.dashboard', 
  ['$q', '$scope', '_', '$timeout', '$state', 'metrics', '$mdDialog', '$http', 
  ($q, $scope, _, $timeout, $state, metrics, $mdDialog, $http) => {

  $http.get('../assets/json/knowledgebaseGlossary.json')
  .then((glossary) => {
    $scope.glossary = _.sortBy(glossary.data, ['term']);
  });  

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

  $scope.showKBDescription = ($event) => {
    let content = "<p>Knowlegebase is a curated database of variants in cancer and their therapeutic, biological, diagnostic, and prognostic implications according to literature.</p>";

    content    += "<p>The main use of Knowlegebase is to act as the link between the known and published variant information and the expermientally collected data. "
    content    += "It is used in generation of reports as well as building target sequences for the targeted alignment pipeline.</p>";

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('About Knowledgebase')
        .htmlContent(content)
        .ok('Close')
        .targetEvent($event)
    );

  };

}]);