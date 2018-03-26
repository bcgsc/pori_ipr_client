app.controller('controller.dashboard.admin.users.userList',
['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', 'users', 'projects', 'groups',
(_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin, users, projects, groups) => {

  $scope.users = users;
  $scope.accessGroup = _.find($scope.groups, function(group) { return group.name === 'Full Project Access' });

  let deleteUser = ($event, user) => {

    let confirm = $mdDialog.confirm()
      .title('Are you sure you want to remove '  + user.firstName + ' ' + user.lastName + '?')
      .htmlContent('Are you sure you want to remove <strong>' + user.firstName + ' ' + user.lastName + '\'s</strong> access to this system? <br /><br />This will <em>not</em> affect access to any other BC GSC services.')
      .ariaLabel('Remove User?')
      .targetEvent($event)
      .ok('Remove User')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(
      () => {
        let tempUser = angular.copy(user);
        // Remove User
        $user.delete(user).then(
          (res) => {
            $scope.users = _.filter($scope.users, (u) => {return (u.ident !== tempUser.ident)});
            $mdToast.show($mdToast.simple('The user has been removed'));
          },
          (err) => {
            $mdToast.show($mdToast.simple('A technical issue prevented the user from being removed.'));
          }
        )
      }
    )

  };

  // Function to pass into
  let passDelete = () => {

    $mdDialog.hide(); // Hide any displayed dialog;
    return deleteUser;
  };

  $scope.userDiag = ($event, editUser, newUser=false) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/user.edit.html',
      clickOutToClose: false,
      locals: {
        editUser: angular.copy(editUser),
        newUser: newUser,
        userDelete: passDelete(),
        projects: projects,
        accessGroup: $scope.accessGroup,
        selfEdit: false
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
