app.directive("iprDataViewer", ['$q', '$parse', '$timeout', '$mdDialog', '_', ($q, $parse, $timeout, $mdDialog, _) => {

  return {
    restrict: 'A',
    scope: {
      data: '=iprDataViewer',
      hidden: '=iprHidden'
    },
    transclude: true,
    template: '<span ng-click="openDialog()" ng-transclude style="margin: 0 3px;"></span>',
    link: (scope, element, attr) => {

      scope.openDialog = () =>{
        $mdDialog.show({
          controller: 'controller.iprDataViewer',
          clickOutsideToClose: true,
          locals: {
            data: scope.data,
            hidden: scope.hidden
          },
          templateUrl: 'ipr-dataViewer/ipr-dataViewer.html'
        });
      };
    },
  } // end return

}]);

// Dialog Controller
app.controller("controller.iprDataViewer", ['$q', '_', '$scope', '$mdDialog', 'data', 'hidden', ($q, _, $scope, $mdDialog, data, hidden) => {

  // Ignored columns
  let ignored = _.merge(['ident', 'id', 'pog_id'], hidden);

  $scope.data = {};

  _.forEach(angular.copy(data), (v, k) => {
    if(ignored.indexOf(k) === -1) $scope.data[k] = v;
  });

  $scope.cancel = () => {
    $mdDialog.cancel();
  }

}]);