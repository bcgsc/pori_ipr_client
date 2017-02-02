app.directive("iprTumourContent", ['$q', '_', ($q, _) => {
  
  // Return Directive Class
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    templateUrl: 'ipr-tumourContent/ipr-tumourContent.html',
    link: (scope, element, attr) => {      
      // Define Scope Details
      let colourCode = Math.round(((attr.tc == "ND") ? 200 : attr.tc) / 5) * 5;
      
      scope.tc = attr.tc;
      element.addClass('tc-'+ colourCode);
    },
  }
  
}]);
