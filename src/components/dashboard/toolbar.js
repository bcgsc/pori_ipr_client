app.controller('controller.dashboard.toolbar', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog',
  '$mdToast', '$timeout', 'isAdmin', '$userSettings', 'api.user', 'keycloakAuth', (_, $scope,
    $mdSidenav, $state, $mdDialog, $mdToast, $timeout, isAdmin, $userSettings, $user,
    keycloakAuth) => {
    $scope.isAdmin = isAdmin;
    $scope.user = $user.meObj;
    $scope.maximized = $userSettings.get('sideBarState');

    // Toggle sidebar
    $scope.toggleSidebar = () => {
      $scope.$emit('sidebarToggle');
      $scope.maximized = !$scope.maximized;
    };

    // Open Feedback
    $scope.openFeedback = ($event) => {
      $mdDialog.show({
        controller: 'controller.dashboard.toolbar.feedback',
        templateUrl: 'dashboard/feedback.html',
        targetEvent: $event,
        clickOutsideToClose: false,
      });
    };

    /**
     * Log out a user session
     *
     */
    $scope.userLogout = async () => {
      try {
        await keycloakAuth.logout();
        $mdToast.showSimple('You have been logged out.');
        $state.go('public.login');
      } catch (err) {
        $mdToast.showSimple('Error: Could not logout due to connection issue.');
        $state.go('public.login');
      }
    };

    // Edit User
    $scope.userDiag = ($event, editUser, newUser = false) => {
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
          selfEdit: true,
        },
        controller: 'controller.dashboard.user.edit',
      }).then(
        (resp) => {
          $mdToast.show($mdToast.simple().textContent(resp.message));
          _.forEach($scope.users, (u, i) => {
            if (u.ident == resp.data.ident) $scope.users[i] = resp.data;
          });
        },
        (err) => {
          $mdToast.show($mdToast.simple().textContent('Your user information has not been updated.'));
        },
      );
    };
  },
]);
