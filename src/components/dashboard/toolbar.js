app.controller('controller.dashboard.toolbar', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session) => {
    
  $scope.accountMenu = {
    'dashboard.profile': 'Profile',
    'dashboard.feedback': 'Feedback'
  };
  
  $scope.toggleMenu = () => {
    console.log('[toolbar]', 'Clicked toggle');
    $mdSidenav('topLevelNavigation').toggle();
  };

  $scope.loadNewPog = ($event) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/loadPOG.html',
      clickOutToClose: false,
      controller: 'controller.dashboard.loadPOG'
    });
  };
  
  $scope.userLogout = () => {

    // Logout user
    $session.logout();
    
    // Push user to public state
    $state.go('public.login');
  }
  
}]);
