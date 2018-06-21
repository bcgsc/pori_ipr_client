app.controller('controller.dashboard.user.edit',
['$q', '_', '$scope', '$mdDialog', '$mdToast', 'api.user', 'api.project', 'editUser', 'newUser', 'userDelete', 'projects', 'accessGroup', 'selfEdit',
($q, _, $scope, $mdDialog, $mdToast, $user, $project, editUser, newUser, userDelete, projects, accessGroup, selfEdit) => {

  // Load User into scope
  $scope.user = editUser;
  $scope.oldUser = angular.copy(editUser); // record of old user values for comparison
  $scope.newUser = newUser;
  $scope.userDelete = userDelete;
  $scope.projects = projects;
  $scope.projectAccess = {projects: $scope.user.projects, allProjectAccess: !!(_.find($scope.user.groups, {ident: accessGroup.ident}))};
  $scope.selfEdit = selfEdit;

  // Creating new user
  if(newUser) {
    $scope.user = {
      username: '',
      type: 'bcgsc',
      firstName: '',
      lastName: ''
    }
  }

  // Setup default user fields
  $scope.local = {
    newPass: '',
    newPassConfirm : '',
  };

  $scope.checkPasswordMatch = () => {
    if($scope.local.newPassConfirm === undefined) {
      $scope.form.NewPassConfirm.$setValidity("nomatch", true);
      return;
    }

    if($scope.local.newPass !== $scope.local.newPassConfirm) {
      $scope.form.NewPassConfirm.$setValidity("nomatch", false);
    } else {
      $scope.form.NewPassConfirm.$setValidity("nomatch", true);
    }
    return;
  }

  $scope.cancel = () => {
    $mdDialog.cancel({status: false, message: "Could not update this user."});
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

    if($scope.user.type === 'local' && (selfEdit || newUser)) {
      $scope.user.password = $scope.local.newPass;
    } else if(newUser) {
      $scope.user.password = null;
    }

    // Send updated user to api
    if(!newUser) {
      // update user/project binding if not self editing
      if (!selfEdit) {
        if($scope.projectAccess.allProjectAccess) { // if full access, add to group
          if(!_.find($scope.oldUser.groups, {name: accessGroup.name})) { // check if user is already part of full access group
            // add to group
            $user.group.member(accessGroup.ident).add($scope.user.ident).then(
              (resp) => {
              },
              (err) => {
                $mdToast.showSimple('User was not given full project access.');
              }
            );
          }
        } else {
          // if not full access, bind to/unbind from projects
          if(_.find($scope.oldUser.groups, {name: accessGroup.name})) { // check if user is part of full access group
            // remove from group
            $user.group.member(accessGroup.ident).remove($scope.user.ident).then(
                (resp) => {
                },
                (err) => {
                  $mdToast.showSimple('User was not removed from full project access.');
                }
              );
          }

          // unbind from projects no longer in list
          let unbind = _.differenceBy($scope.oldUser.projects, $scope.projectAccess.projects, 'name');
          _.each(unbind, function(project) {
            $project.user(project.ident).remove($scope.user.ident).then(
              (resp) => {
              },
              (err) => {
                $mdToast.showSimple('User was not removed from project ' + project.name);
                console.log('Unable to remove user from project', err);
              }
            );
          });

          // bind to new projects in list
          let bind = _.differenceBy($scope.projectAccess.projects, $scope.oldUser.projects, 'name');
          _.each(bind, function(project) {
            $project.user(project.ident).add($scope.user.ident).then(
              (resp) => {
              },
              (err) => {
                $mdToast.showSimple('User was not added to project ' + project.name);
                console.log('Unable to add user to project', err);
              }
            );
          });
        }
      }
      // update user
      $user.update($scope.user).then(
        (user) => {
          // Update user projects
          user.projects = $scope.projectAccess.projects;

          // Update user groups
          if($scope.projectAccess.allProjectAccess && !_.find(user.groups, {'name': accessGroup.name})) {
            user.groups.push(accessGroup);
          }
          if(!$scope.projectAccess.allProjectAccess && _.find(user.groups, {'name': accessGroup.name})) {
            _.remove(user.groups, function(group) {
              return group.name == accessGroup.name;
            })
          }

          // Success - return updated user
          $mdDialog.hide({status: true, data: user, message: "User has been updated!"});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not update this user."});
        }
      );
      return;
    }

    // Send new user to api
    if(newUser) {
      // create user
      $user.create($scope.user).then(
        (user) => {
          // create user/project binding
          if($scope.projectAccess.allProjectAccess) { // if full access, add to group
            // Add user to group
            $user.group.member(accessGroup.ident).add(user.ident).then(
              (resp) => {
              },
              (err) => {
                $mdToast.showSimple('User was not given full project access.');
              }
            );
          } else { // if not full access, bind to projects
            let added = 0;
            _.each($scope.projectAccess.projects, function(project) {
              $project.user(project.ident).add(user.ident).then(
                (resp) => {
                },
                (err) => {
                  $mdToast.showSimple('User was not added to project ' + project.name);
                  console.log('Unable to add user to project', err);
                }
              );
            });
          }

          // Add user projects
          user.projects = $scope.projectAccess.projects;

          // Add user group
          if($scope.projectAccess.allProjectAccess) {
            user.groups = [accessGroup];
          }

          // Success - return newly added user
          $mdDialog.hide({status: true, data: user, message: "User has been added!", useUser: true});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not update this user."});
        }
      )
    }
  };

}]);