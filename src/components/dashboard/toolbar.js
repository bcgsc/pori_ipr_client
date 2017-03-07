app.controller('controller.dashboard.toolbar',
  ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'isAdmin',
    (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, isAdmin) => {

      $scope.isAdmin = isAdmin;
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

      /**
       * Log out a user session
       *
       */
      $scope.userLogout = () => {

        $session.logout().then(
          (resp) => {
            // Success from API
            $mdToast.showSimple('You have been logged out.');
            $state.go('public.login');
          },
          (err) => {
            $mdToast.showSimple('We were not able to log you out.');
          }
        );

      }

    }
  ]
);
