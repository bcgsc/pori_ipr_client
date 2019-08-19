import sortBy from 'lodash.sortby';
import template from './users.pug';

const bindings = {
  users: '<',
  projects: '<',
  groups: '<',
};

class UsersComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, UserService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.UserService = UserService;
  }

  async $onInit() {
    this.accessGroup = this.groups.find(group => group.name === 'Full Project Access');

    const deleteUser = async ($event, user) => {
      const confirm = this.$mdDialog.confirm()
        .title(`Are you sure you want to remove ${user.firstName} ${user.lastName}?`)
        .htmlContent(`Are you sure you want to remove <strong>${user.firstName} ${user.lastName}'s</strong> access to this system? <br/><br/>This will <em>not</em> affect access to any other BC GSC services.`)
        .ariaLabel('Remove User?')
        .targetEvent($event)
        .ok('Remove User')
        .cancel('Cancel');
  
      try {
        await this.$mdDialog.show(confirm);
        const tempUser = angular.copy(user);
        // Remove User
        await this.UserService.remove(user);
        this.users = this.users.filter(u => u.ident !== tempUser.ident);
        this.$mdToast.show(this.$mdToast.simple('The user has been removed'));
      } catch (err) {
        this.$mdToast.show(this.$mdToast.simple('A technical issue prevented the user from being removed.'));
      }
    };
  
    this.passDelete = () => {
      // Hide any displayed dialog;
      this.$mdDialog.hide();
      return deleteUser;
    };
  }

  async userDiag($event, editUser, newUser = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: '<user-edit edit-user="editUser" new-user="newUser" user-delete="userDelete" projects="projects" access-group="accessGroup" self-edit="selfEdit"></user-edit>',
        clickOutsideToClose: true,
        locals: {
          editUser: angular.copy(editUser),
          newUser,
          userDelete: this.passDelete(),
          projects: this.projects,
          accessGroup: this.accessGroup,
          selfEdit: false,
        },
        /* eslint-disable no-shadow */
        controller: ($scope, editUser, newUser, userDelete, projects, accessGroup, selfEdit) => {
          'ngInject';

          $scope.editUser = editUser;
          $scope.newUser = newUser;
          $scope.userDelete = userDelete;
          $scope.projects = projects;
          $scope.accessGroup = accessGroup;
          $scope.selfEdit = selfEdit;
        },
      });
      this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
      this.users.forEach((u, i) => {
        if (u.ident === resp.data.ident) {
          this.users[i] = resp.data;
        }
      });

      if (newUser) {
        this.users.push(resp.data);
        this.users = sortBy(this.users, 'username');
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('The user has not been updated.'));
    }
  }
}

export default {
  template,
  bindings,
  controller: UsersComponent,
};
