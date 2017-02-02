app.controller('controller.dashboard.toolbar', ['_', '$scope', '$mdSidenav', '$state', 'api.session', (_, $scope, $mdSidenav, $state, $session) => {
    
  $scope.accountMenu = {
    'dashboard.profile': 'Profile',
    'dashboard.feedback': 'Feedback'
  }
  
  $scope.toggleMenu = () => {
    console.log('[toolbar]', 'Clicked toggle');
    $mdSidenav('topLevelNavigation').toggle();
  }
  
  $scope.userLogout = () => {
    
    console.log('Running logout func');
    
    // Logout user
    $session.logout();
    
    // Push user to public state
    $state.go('public.login');
    
  }
  
}]);
