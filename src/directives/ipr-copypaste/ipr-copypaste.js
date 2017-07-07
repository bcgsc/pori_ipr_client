app.directive("iprCopypaste", ['$q', '_', '$timeout', '$mdToast', ($q, _, $timeout, $mdToast) => {

  return {
    restrict: 'E',
    transclude: false,
    scope: {
      text: '=text',
    },
    templateUrl: 'ipr-copypaste/ipr-copypaste.html',
    link: (scope, element, attr) => {

      scope.changeCopyTooltip = () => {
        scope.copyTooltip = 'Copied!';
        $timeout(()=> {
          scope.copyTooltip = "Copy to clipboard";
        },3000);
        $mdToast.show($mdToast.simple().textContent('Copied to clipboard!'));
      };

    } // end link
  } // end return

}]);
