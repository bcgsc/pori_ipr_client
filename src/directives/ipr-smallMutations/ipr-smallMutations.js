app.directive("iprSmallMutations", ['$q', '_', ($q, _) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      mutations: '=mutations',
      pog: '=pog'
    },
    templateUrl: 'ipr-smallMutations/ipr-smallMutations.html',
    link: (scope, element, attr) => {

      scope.copyFilter = (copyChange) => {
        return copyChange.match(/(((\+|\-)?)[0-9]{1,2})/g)[0];
      }

    } // end link
  } // end return

}]);
