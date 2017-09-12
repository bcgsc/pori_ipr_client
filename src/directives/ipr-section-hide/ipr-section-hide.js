app.directive("iprSectionHide", ['$q', '_', ($q, _) => {
  
  return {
    restrict: 'EA',
    transclude: false,
    scope: {
      state: '=flipState',
    },
    templateUrl: 'ipr-section-hide/ipr-section-hide.html',
    link: (scope, element, attr) => {
    
    } // end link
  }; // end return
  
}]);
