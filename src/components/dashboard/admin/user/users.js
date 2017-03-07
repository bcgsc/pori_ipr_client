app.controller('controller.dashboard.admin.users', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin) => {

  let passDelete = () => { return () => {}};

  $scope.userDiag = ($event, editUser, newUser=false) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/user.edit.html',
      clickOutToClose: false,
      locals: {
        editUser: angular.copy(editUser),
        newUser: newUser,
        userDelete: passDelete()
      },
      controller: 'controller.dashboard.user.edit'
    }).then(
      (resp) => {
        $mdToast.show($mdToast.simple().textContent(resp.message));
        _.forEach($scope.users, (u,i)=>{
          if(u.ident == resp.data.ident) $scope.users[i] = resp.data;
        });

        if(newUser) {
          $scope.users.push(resp.data);
          $scope.users = _.sortBy($scope.users, 'username');
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The user has not been updated.'));
      }
    );

  };

}]);
