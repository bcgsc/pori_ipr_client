app.controller('controller.dashboard.user.groups.edit', ['$q', '_', '$scope', '$mdDialog','api.user', 'editGroup', 'newGroup', 'groupDelete', ($q, _, scope, $mdDialog, $user, editGroup, newGroup, groupDelete) => {

  // Load User into scope
  scope.group = editGroup;
  scope.newGroup = newGroup;
  scope.groupDelete = groupDelete;
  
  // Creating new user
  if(newGroup) {
    scope.group = {
      name: '',
    }
  }

  scope.searchUsers = (searchText) => {
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

  scope.searchOwner = (searchOwnerText) => {
    let deferred = $q.defer();

    if(searchOwnerText.length === 0) return [];

    $user.search(searchOwnerText).then(
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


  scope.cancel = () => {
    $mdDialog.cancel({status: false, message: "Could not update this group."});
  };

  scope.addUser = () => {

    if(_.find(scope.group.users, {ident: scope.member.ident})) return alert('This user has already been added to the group');

    // Add user to group
    $user.group.member(scope.group.ident).add(scope.member.ident).then(
      (resp) => {
        scope.group.users.push(resp);

        scope.member = null;
        scope.searchQuery = '';

      },
      (err) => {
        console.log('Unable to add user', err);
      }
    )

  };

  // Remove user from group
  scope.removeUser = ($event, user) => {

    if(confirm('Are you sure you want to remove '+ user.firstName + ' ' + user.lastName +' from '+ scope.group.name +'?')) {
      $user.group.member(scope.group.ident).remove(user.ident).then(
        (resp) => {
          // Remove entry from group list
          scope.group.users = _.filter(scope.group.users, (u) => {
            return (u.ident !== user.ident)
          });
        },
        (err) => {
          console.log('Unable to remove user from group', err);
        }
      );
    }

  };

  // Validate form and submit
  scope.update = (f) => {
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

    scope.group.owner = scope.group.owner.ident;
    
    // Send updated user to api
    if(!newGroup) {
      $user.group.update(scope.group.ident, scope.group).then(
        (group) => {
          // Success
          $mdDialog.hide({status: true, data: group, message: "The group has been updated!"});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not update this group."});
        }
      )
    }
    // Send updated user to api
    if(newGroup) {
      $user.group.create(scope.group).then(
        (group) => {
          // Success
          $mdDialog.hide({status: true, data: group, message: "The group has been added!", newGroup: true});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not update this group."});
        }
      )
    }

  };

}]);