app.controller('controller.dashboard.toolbar',
  ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', '$timeout', 'api.session', 'isAdmin', "$userSettings",
    (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $timeout, $session, isAdmin, $userSettings) => {

      $scope.isAdmin = isAdmin;
      $scope.holiday_lights = $userSettings.get('holiday_lights');

      $scope.toggleMenu = () => {
        $mdSidenav('topLevelNavigation').toggle();
      };
      
      
      $scope.toggleLights = ($ev) => {
        $scope.holiday_lights = !$scope.holiday_lights;
        $userSettings.save('holiday_lights', $scope.holiday_lights);
        
      };
      
      if($userSettings.get('holiday_lights') !== true && $userSettings.get('holiday_lights') !== false) {
        
        $scope.holiday_lights = true;
        
        $timeout(() => {
          $mdDialog.show($mdDialog.confirm()
          .title('Holiday Lights')
          .htmlContent("Happy Holidays! Some festive lights have been added to IPR for the holidays. <br \><br \> Holiday lights can be toggled at any time by clicking your name on the top right, and selecting \"Toggle Lights\"")
          .ok("Keep them on")
          .cancel("Turn them off"))
          
            .then((response) => {
              $userSettings.save('holiday_lights', true);
            })
            .catch((err) => {
              $userSettings.save('holiday_lights', false);
              $scope.holiday_lights = false;
            });
        }, 2000)
      }

      // Open Feedback
      $scope.openFeedback = ($event) => {

        $mdDialog.show({
          controller: 'controller.dashboard.toolbar.feedback',
          templateUrl: 'dashboard/feedback.html',
          targetEvent: $event,
          clickOutsideToClose: false,
        }).then(
          (res) => {
            // Toast!
          },
          (cancel) => {
            // Toast!
          }
        )

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
