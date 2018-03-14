app.controller('controller.dashboard.toolbar',
  ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', '$timeout', 'api.session', 'isAdmin', "$userSettings",
    (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $timeout, $session, isAdmin, $userSettings) => {

      $scope.isAdmin = isAdmin;
      $scope.user = $session.user();

      $scope.toggleMenu = () => {
        $mdSidenav('topLevelNavigation').toggle();
      };
      

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

      // Edit User
      $scope.userDiag = ($event, editUser, newUser=false) => {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/admin/user/user.edit.html',
          clickOutToClose: false,
          locals: {
            editUser: angular.copy(editUser),
            newUser: newUser,
            userDelete: {},
            projects: [],
            accessGroup: {},
            selfEdit: true
          },
          controller: 'controller.dashboard.user.edit'
        }).then(
          (resp) => {
            $mdToast.show($mdToast.simple().textContent(resp.message));
            _.forEach($scope.users, (u,i)=>{
              if(u.ident == resp.data.ident) $scope.users[i] = resp.data;
            });
          },
          (err) => {
            $mdToast.show($mdToast.simple().textContent('Your user information has not been updated.'));
          }
        );

      };

    }
  ]
);
