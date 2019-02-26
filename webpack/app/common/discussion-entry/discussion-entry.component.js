app.directive("iprDiscussionEntry", ['$q', '_', '$mdToast', 'api.presentation', ($q, _, $mdToast, $presentation) => {
  
  return {
    restrict: 'E',
    scope: {
      patient: '=patient',
      report: '=report',
      entry: '=entry',
      user: '=user'
    },
    templateUrl: 'ipr-discussion-entry/ipr-discussion-entry.html',
    link: ($scope, element, attr) => {
    
      $scope.editing = false; // Editing mode
      $scope.entryCache = null; // Editing Cache
      $scope.removed = false; // Entry removed
      
      // Canceling edit / restoring previous state
      $scope.cancelEdit = () => {
        $scope.entry.body = $scope.entryCache;
        $scope.entryCache = null;
        $scope.editing = false;
      };
      
      // Enable editing mode
      $scope.edit = () => {
        $scope.entryCache = angular.copy($scope.entry.body);
        $scope.editing = true;
      };
      
      // Trigger save
      $scope.save = (f) => {
        
        $presentation.discussion.update($scope.patient.POGID, $scope.report.ident, $scope.entry.ident, {body: $scope.entry.body})
          .then((result) => {
            $scope.entry = result;
            $scope.editing = false;
            $scope.entryCache = null;
          })
          .catch((e) => {
            $mdToast.showSimple('Unable to save the updated entry');
          });
        
      };
      
      // Remove entry
      $scope.remove = () => {
      
        $presentation.discussion.remove($scope.patient.POGID, $scope.report.ident, $scope.entry.ident)
          .then((result) => {
            $scope.removed = true;
            $scope.entry.body = null;
            $scope.editing = false;
          })
          .catch((e) => {
            $scope.editing = false;
          })
      
      }
    
    },
  } // end return
  
}]);
