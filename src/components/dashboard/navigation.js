app.controller('controller.dashboard.navigation', ['_', '$scope', '$mdSidenav', (_, $scope, $mdSidenav) => {
    
  $scope.menuItems = {
    'dashboard.profile': 'Profile',
    'dashboard.reports': 'Reports',
    'dashboard.logout': 'Logout'
  }
}]);
