app.controller('controller.dashboard.admin.users',
['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', 'groups', 'users', 'projects',
(_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin, groups, users, projects) => {

  let passDelete = () => { return () => {}};

  $scope.groups = groups;
  $scope.projects = projects;
  $scope.accessGroup = _.find($scope.groups, function(group) { return group.name === 'Full Project Access' });

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
        accessGroup: $scope.accessGroup
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
          $scope.groups.push(resp.data);
          $scope.groups = _.sortBy($scope.groups, 'name');
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The group has not been updated.'));
      }
    );

  };

  $scope.projectDiag = ($event, editProject, newProject=false) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/project.edit.html',
      clickOutToClose: false,
      locals: {
        editProject: angular.copy(editProject),
        newProject: newProject,
        projectDelete: passDelete()
      },
      controller: 'controller.dashboard.user.project.edit'
    }).then(
      (resp) => {
        $mdToast.show($mdToast.simple().textContent('The project has been added'));

        if(newProject) {
          $scope.projects.push(resp.data);
          $scope.projects = _.sortBy($scope.projects, 'name');
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The project has not been updated.'));
      }
    );

  };

}]);
