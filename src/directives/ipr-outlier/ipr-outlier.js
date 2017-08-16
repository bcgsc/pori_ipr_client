app.directive("iprOutlier", ['$q', '_', ($q, _) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      outliers: '=outliers',
      pog: '=pog',
      report: '=report',
      gv: '=?gv'
    },
    templateUrl: 'ipr-outlier/ipr-outlier.html',
    link: (scope, element, attr) => {
      
      if(!scope.gv) scope.gv = true;

    } // end link
  } // end return

}]);
