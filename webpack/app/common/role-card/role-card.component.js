app.directive("iprPogRole", ['$q', '_', '$mdDialog', '$mdToast', 'indefiniteArticleFilter', ($q, _, $mdDialog, $mdToast, indefiniteArticleFilter) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      role: '=role',
      removeEntry: '=remove'
    },
    templateUrl: 'ipr-pog-role/ipr-pog-role.html',
    link: (scope, element, attr) => {

      scope.remove = ($event) => {

        let confirm = $mdDialog.confirm()
          .title('Are you sure you want to remove this user?')
          .textContent('Are you sure you want to remove '+scope.role.user.firstName + ' ' + scope.role.user.lastName + ' as ' + indefiniteArticleFilter(scope.role.role) + ' ' + scope.role.role + '?')
          .ariaLabel('Confirm remove user')
          .targetEvent($event)
          .ok('Confirm')
          .cancel('Cancel');

          $mdDialog.show(confirm).then(
            () => {
              let role = angular.copy(scope.role);
              $mdToast.show($mdToast.simple().textContent(role.user.firstName + ' ' + role.user.lastName + ' has been removed as ' + indefiniteArticleFilter(scope.role.role) + ' ' + role.role + '.'));
              // Remove Entry
              scope.removeEntry(scope.role);
            },
            () => {
              $mdToast.show($mdToast.simple().textContent('No changes were made.'));
            }
          );
      }

    } // end link
  }; // end return

}]);
