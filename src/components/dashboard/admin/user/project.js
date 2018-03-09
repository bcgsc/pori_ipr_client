app.controller('controller.dashboard.admin.users.projects', 
['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.project', 'isAdmin', 'projects', 
(_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $project, isAdmin, projects) => {

  $scope.projects = projects;


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
            console.log('scope before delete');
            console.log($scope.projects);
            $scope.projects = _.filter($scope.projects, (p) => {return (p.ident !== tempProject.ident)});
            $mdToast.show($mdToast.simple('The project has been removed'));
            console.log('scope after delete');
            console.log($scope.projects);
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
        projectDelete: passDelete()
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
          $scope.projects = projects = _.sortBy($scope.projects, 'name');
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The project has not been updated.'));
      }
    );

  };

}]);
