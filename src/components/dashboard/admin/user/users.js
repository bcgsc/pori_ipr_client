app.controller('controller.dashboard.admin.users',
['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', 'groups', 'users',
(_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin, groups, users) => {

  let passDelete = () => { return () => {}};

  $scope.groups = groups;

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
          users.push(resp.data);
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The user has not been updated.'));
      }
    );

  };

  $scope.groupDiag = ($event, editGroup, newGroup=false) => {

    console.log('Edit Group', editGroup, newGroup);

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/group.edit.html',
      clickOutToClose: false,
      locals: {
        editGroup: angular.copy(editGroup),
        newGroup: newGroup,
        groupDelete: passDelete()
      },
      controller: 'controller.dashboard.user.groups.edit'
    }).then(
      (resp) => {
        $mdToast.show($mdToast.simple().textContent('The group has been added'));

        if(newGroup) {
          console.log('Adding new group', resp.data, $scope.groups);

          $scope.groups.push(resp.data);
          $scope.groups = _.sortBy($scope.groups, 'name');
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The group has not been updated.'));
      }
    );

  };

}]);
