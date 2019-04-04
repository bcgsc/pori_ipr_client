app.directive("iprPaginate", ['$q', '_', 'api.pog_analysis_report', '$timeout', ($q, _, $report, $timeout) => {
  
  return {
    restrict: 'E',
    transclude: false,
    scope: {
      offset: '=offset',
      limit: '=limit',
      total: '=total',
      refresh: '=refresh'
    },
    templateUrl: 'ipr-paginate/ipr-paginate.html',
    link: (scope, element, attr) => {
      
      
      scope.$watch('limit', (newVal, oldVal) => {
        if(newVal === oldVal) return;
        scope.offset = 0;
        $timeout(() => {
          scope.refresh();
        }, 100);
      });
      
      scope.prevPage = () => {
        scope.offset -= scope.limit;
        $timeout(() => {
          scope.refresh();
        }, 100);
      };
      
      scope.nextPage = () => {
        scope.offset += scope.limit;
        $timeout(() => {
          scope.refresh();
        }, 100);
      };
      
    } // end link
  }; // end return
  
}]);
