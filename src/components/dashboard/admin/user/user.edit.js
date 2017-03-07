app.controller('controller.dashboard.user.edit', ['$q', '_', '$scope', '$mdDialog','api.user', 'editUser', 'newUser', 'userDelete', ($q, _, scope, $mdDialog, $user, editUser, newUser, userDelete) => {

  // Load User into scope
  scope.user = editUser;
  scope.newUser = newUser;
  scope.userDelete = userDelete;

  // Creating new user
  if(newUser) {
    scope.user = {
      username: '',
      type: 'bcgsc',
      firstName: '',
      lastName: ''
    }
  }

  // Setup default user fields
  scope.local = {
    newPass: '',
    newPassConfirm : '',
  };

  scope.cancel = () => {
    $mdDialog.cancel({status: false, message: "Could not update this user."});
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

    // If type === local create password entry
    if(scope.user.type === 'local' && scope.local.newPass.length > 0) {

      // Check password length
      if(scope.local.newPass !== scope.local.newPassConfirm) {
        f.NewPassConfirm.$error.nomatch = true;
        f.$valid = false;
        f.$invalid = true;
        f.NewPassConfirm.$invalid = true;
        f.NewPassConfirm.$valid = false;
        return;
      }

      scope.user.password = scope.local.newPass;
    } else {
      scope.user.password = '';
    }

    // Send updated user to api
    if(!newUser) {
      $user.update(scope.user).then(
        (user) => {
          // Success
          $mdDialog.hide({status: true, data: user, message: "User has been updated!"});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not update this user."});
        }
      )
    }
    // Send updated user to api
    if(newUser) {
      $user.create(scope.user).then(
        (user) => {
          // Success
          $mdDialog.hide({status: true, data: user, message: "User has been added!", useUser: true});
        },
        (err) => {
          $mdDialog.cancel({status: false, message: "Could not update this user."});
        }
      )
    }

  };

}]);