app.controller('controller.dashboard.user.project.edit', 
['$q', '_', '$scope', '$mdDialog', '$mdToast', 'api.project', 'api.user', 'api.pog', 'editProject', 'newProject', 'projectDelete', 'fullAccessUsers',
($q, _, $scope, $mdDialog, $mdToast, $project, $user, $pog, editProject, newProject, projectDelete, fullAccessUsers) => {

  // Load project into $scope
  $scope.project = editProject;
  $scope.oldProject = angular.copy(editProject); // record of old values for project for comparison
  $scope.newProject = newProject;
  $scope.projectDelete = projectDelete;
  
  // Creating new project
  if(newProject) {
    $scope.project = {
      name: '',
    }
  }

  $scope.project.users = _.orderBy($scope.project.users, ['firstName']);

  $scope.isUniqueProject = (searchText) => {
    let deferred = $q.defer();

    if(searchText === undefined || searchText.length === 0) return;

    $project.all({admin: true}).then(
      (resp) => {
        let allProjects = resp.map(function (p) {
          return p.name.toLowerCase(); // create array of project names
        });

        // If editing a project, don't check against own name
        if(!newProject) {
          _.remove(allProjects, function (p) {
            return p === $scope.oldProject.name.toLowerCase();
          });
        }

        if(allProjects.indexOf(searchText.toLowerCase()) != -1) {
          $scope.form.Project.$setValidity("unique", false);
        } else {
          $scope.form.Project.$setValidity("unique", true);
        }

        deferred.resolve();
      },
      (err) => {
        console.log(err);
        deferred.reject();
      }
    );

    return deferred.promise;    
  };

  $scope.searchUsers = (searchText) => {
    let deferred = $q.defer();

    if(searchText.length === 0) return [];

    $user.search(searchText).then(
      (resp) => {
        deferred.resolve(resp);
      },
      (err) => {
        console.log(err);
        deferred.reject();
      }
    );

    return deferred.promise;
  };

  $scope.searchPOGs = (searchText) => {
    let deferred = $q.defer();

    if(searchText.length === 0) return [];
    $pog.all({query: searchText, all: true}).then(
      (resp) => {
        deferred.resolve(resp);
      },
      (err) => {
        console.log(err);
        deferred.reject();
      }
    );

    return deferred.promise;
  };

  $scope.cancel = () => {
    $mdDialog.cancel({status: false, message: "Could not update this project."});
  };

  // Add user to project
  $scope.addUser = () => {

    if(_.find($scope.project.users, {ident: $scope.member.ident})) return $mdToast.showSimple('This user has already been added to the project');

    // Add user to project
    $project.user($scope.project.ident).add($scope.member.ident).then(
      (resp) => {
        $scope.project.users.push(resp);

        $scope.member = null;
        $scope.searchQuery = '';

      },
      (err) => {
        console.log('Unable to add user to project', err);
      }
    );

  };

  // Remove user from project
  $scope.removeUser = ($event, user) => {

    if(confirm('Are you sure you want to remove ' + user.firstName + ' ' + user.lastName + ' from ' + $scope.project.name + '?')) {
      $project.user($scope.project.ident).remove(user.ident).then(
        (resp) => {
          // Remove entry from project list
          $scope.project.users = _.filter($scope.project.users, (u) => {
            return (u.ident !== user.ident)
          });

          // If user is in full access group re-add to list with access flag
          if(_.find(fullAccessUsers, {'ident': user.ident})) {
            user.fullAccess = true;
            $scope.project.users.push(user);
          }

          $scope.project.users = _.orderBy($scope.project.users, ['firstName']);
        },
        (err) => {
          console.log('Unable to remove user from project', err);
        }
      );
    }

  };

  // Add sample to project
  $scope.addPOG = () => {

    if(_.find($scope.project.pogs, {ident: $scope.pog.ident})) return $mdToast.showSimple('This sample has already been added to the project');

    // Add user to project
    $project.pog($scope.project.ident).add($scope.pog.ident).then(
      (resp) => {
        $scope.project.pogs.push(resp);

        $scope.pog = null;
        $scope.searchPOG = '';

      },
      (err) => {
        console.log('Unable to add sample to project', err);
      }
    )

  };

  // Remove sample from project
  $scope.removePOG = ($event, pog) => {

    if(confirm('Are you sure you want to remove ' + pog.POGID + ' from ' + $scope.project.name + '?')) {
      $project.pog($scope.project.ident).remove(pog.ident).then(
        (resp) => {
          // Remove entry from project list
          $scope.project.pogs = _.filter($scope.project.pogs, (p) => {
            return (p.ident !== pog.ident)
          });
        },
        (err) => {
          console.log('Unable to remove sample from project', err);
        }
      );
    }

  };

  // Validate form and submit
  $scope.update = (f) => {
    // Check for valid inputs by touching each entry
    if(f.$invalid) {
      f.$setDirty();
      angular.forEach(f.$error, (field) => {
        angular.forEach(field, (errorField) => {
          errorField.$setTouched();
        });
      });
      return;
    }

    //$scope.project.owner = $scope.project.owner.ident;
    
    // Send updated project to api
    if(!newProject) {

      let updatedProject = {
        ident: $scope.project.ident,
        name: $scope.project.name
      }

      $project.update(updatedProject).then(
        (project) => {
          // Success
          $mdDialog.hide({status: true, data: project, message: "The project has been updated!"});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not update this project."});
        }
      )
    }
    // Send updated project to api
    if(newProject) {
      $project.add($scope.project).then(
        (project) => {
          // Success
          $mdDialog.hide({status: true, data: project, message: "The project has been added!", newProject: true});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not add new project."});
        }
      )
    }

  };

}]);