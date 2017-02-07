app.directive("iprOutlier", ['$q', '_', ($q, _) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      outliers: '=outliers',
      pog: '=pog'
    },
    templateUrl: 'ipr-outlier/ipr-outlier.html',
    link: (scope, element, attr) => {


    } // end link
  } // end return

}]);
