app.directive("iprProgressor", ['$q', '_', ($q, _) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      stages: '=iprStages',
      active: '=iprActiveStage'
    },
    templateUrl: 'ipr-progressor/ipr-progressor.html',
    link: (scope, element, attr) => {

      scope.changeStage = (stage) => {
        if(stage < scope.active) scope.active = stage;
      }

    } // end link
  }; // end return

}]);
