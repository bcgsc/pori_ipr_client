app.controller('controller.dashboard.admin.users.projects', 
['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.project', 'isAdmin', 'projects', 'groups',
(_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $project, isAdmin, projects, groups) => {

  $scope.projects = projects;
  let accessGroup = _.find($scope.groups, function(group) { return group.name === 'Full Project Access' });
  
  // getting list of users with full access to display as project members
  let fullAccessUsers = _.map(accessGroup.users, function(user) {
    let fullAccessUser = user;
    fullAccessUser.fullAccess = true; // flag to prevent removal option
    return fullAccessUser;
  });

  _.each(projects, function(project) {
    _.each(fullAccessUsers, function(user) {
      // adding all access users to each projects list of users
      // if the user has full access but also belongs to project, dont replace so that we can allow "removal"
      if(!_.find(project.users, {'ident': user.ident})) {
        project.users.push(user);
      }
    });
  });

  let deleteProject = ($event, project) => {

    let confirm = $mdDialog.confirm()
      .title('Are you sure you want to remove '  + project.name + '?')
      .htmlContent('Are you sure you want to remove the project <strong>' + project.name + '</strong>?<br /><br />This will <em>not</em> affect access to any other BC GSC services.')
      .ariaLabel('Remove Project?')
      .targetEvent($event)
      .ok('Remove Project')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(
      () => {
        let tempProject = angular.copy(project);
        // Remove User
        $project.remove(project).then(
          (res) => {
            $scope.projects = $scope.$parent.projects = _.filter($scope.projects, (p) => {return (p.ident !== tempProject.ident)});
            $mdToast.show($mdToast.simple('The project has been removed'));
          },
          (err) => {
            $mdToast.show($mdToast.simple('A technical issue prevented the project from being removed.'));
          }
        )
      }
    )

  };

  // Function to pass into
  let passDelete = () => {

    $mdDialog.hide(); // Hide any displayed dialog;
    return deleteProject;
  };

  $scope.projectDiag = ($event, editProject, newProject=false) => {

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/admin/user/project.edit.html',
      clickOutToClose: false,
      locals: {
        editProject: angular.copy(editProject),
        newProject: newProject,
        projectDelete: passDelete(),
        fullAccessUsers: fullAccessUsers
      },
      controller: 'controller.dashboard.user.project.edit'
    }).then(
      (resp) => {
        $mdToast.show($mdToast.simple().textContent(resp.message));
        _.forEach($scope.projects, (p,i)=>{
          if(p.ident === resp.data.ident) $scope.projects[i] = resp.data;
        });

        if(newProject) {
          $scope.projects.push(resp.data);
          $scope.projects = $scope.$parent.projects = _.sortBy($scope.projects, 'name');
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The project has not been updated.'));
      }
    );

  };

}]);
