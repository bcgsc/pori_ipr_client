app.directive("iprCnv", ['$q', '_', ($q, _) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      cnvs: '=cnvs',
      pog: '=pog'
    },
    templateUrl: 'ipr-cnv/ipr-cnv.html',
    link: (scope, element, attr) => {

      scope.copyFilter = (copyChange) => {
        return copyChange.match(/(((\+|\-)?)[0-9]{1,2})/g)[0];
      }

    } // end link
  } // end return

}]);
