app.controller('controller.public.requestAccount', 
['$q', '_', '$scope', '$mdDialog', 
($q, _, $scope, $mdDialog) => {
  
  // Close Dialog
  $scope.cancel = () => { $mdDialog.cancel(); };

}]);