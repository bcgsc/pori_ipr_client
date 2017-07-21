app.controller('controller.dashboard.admin.users.groups', ['_', '$scope', '$mdSidenav', '$state', '$mdDialog', '$mdToast', 'api.session', 'api.user', 'isAdmin', 'groups', (_, $scope, $mdSidenav, $state, $mdDialog, $mdToast, $session, $user, isAdmin, groups) => {

  $scope.groups = groups;


  let deleteGroup = ($event, group) => {

    let confirm = $mdDialog.confirm()
      .title('Are you sure you want to remove '  + group.name + '?')
      .htmlContent('Are you sure you want to remove the group <strong>' + group.name + '</strong>?<br /><br />This will <em>not</em> affect access to any other BC GSC services.')
      .ariaLabel('Remove Group?')
      .targetEvent($event)
      .ok('Remove Group')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(
      () => {
        let tempGroup = angular.copy(group);
        // Remove User
        $user.group.remove(group).then(
          (res) => {
            $scope.groups = _.filter($scope.groups, (g) => {return (g.ident !== tempGroup.ident)});
            $mdToast.show($mdToast.simple('The group has been removed'));
          },
          (err) => {
            $mdToast.show($mdToast.simple('A technical issue prevented the group from being removed.'));
          }
        )
      }
    )

  };

  // Function to pass into
  let passDelete = () => {

    $mdDialog.hide(); // Hide any displayed dialog;
    return deleteGroup;
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
        $mdToast.show($mdToast.simple().textContent(resp.message));
        _.forEach($scope.groups, (g,i)=>{
          if(g.ident == resp.data.ident) $scope.groups[i] = resp.data;
        });

        if(newGroup) {
          $scope.groups.push(resp.data);
          $scope.groups = groups = _.sortBy($scope.groups, 'name');
        }
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('The group has not been updated.'));
      }
    );

  };

}]);
