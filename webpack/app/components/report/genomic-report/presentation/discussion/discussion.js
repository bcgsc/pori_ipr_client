app.controller('controller.dashboard.report.genomic.discussion',
['_', '$q', '$scope', 'pog', 'report', '$mdDialog', '$mdToast', 'api.presentation', 'discussions', 'user',
(_, $q, $scope, pog, report, $mdDialog, $mdToast, $presentation, discussions, user) => {
  
  $scope.pog = pog;
  $scope.report = report;
  $scope.discussions = discussions;
  $scope.new = { body: null };
  $scope.user = user;
  
  $scope.add = (f) => {
    
    console.log($scope.new);
    
    let data = {
      body: $scope.new.body
    };
    
    $presentation.discussion.create(pog.POGID, report.ident, data)
      .then((result) => {
        $scope.discussions.push(result);
        $scope.new.body = null;
      })
      .catch((e) => {
        $mdToast.showSimple('Unable to add new discussion entry');
      });
    
  };
  
  
}]);
