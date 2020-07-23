import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import toastCreator from '@/utils/toastCreator';
import dialogCreator from '@/utils/dialogCreator';
import UserService from '@/services/management/user.service';
import GroupService from '@/services/management/group.service';
import ProjectService from '@/services/management/project.service';
import lazyInjector from '@/lazyInjector';

import sortBy from 'lodash.sortby';
import template from './users.pug';

class Users {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  async $onInit() {
    const [users, groups, projects] = await Promise.all([
      UserService.all(),
      GroupService.all(),
      ProjectService.all({ admin: true }),
    ]);

    this.users = users;
    this.groups = groups;
    this.projects = projects;

    this.accessGroup = this.groups.find(group => group.name === 'Full Project Access');

    // eslint-disable-next-line consistent-return
    const deleteUser = async ($event, user) => {
      const confirm = dialogCreator({
        $event,
        title: `Are you sure you want to remove ${user.firstName} ${user.lastName}?`,
        text: `
          Are you sure you want to remove <strong>${user.firstName} ${user.lastName}'s</strong> access to this system? <br/><br/>This will <em>not</em> affect access to any other BC GSC services.
        `,
        actions: [{ click: this.$mdDialog.cancel, text: 'Cancel' }, { click: this.$mdDialog.hide, text: 'Remove User' }],
      });
  
      try {
        try {
          this.$mdDialog.hide();
          await this.$mdDialog.show(confirm);
        } catch (e) {
          return this.$mdToast.show(toastCreator('The user has not been removed'));
        }
        const tempUser = angular.copy(user);
        // Remove User
        await this.UserService.remove(user);
        this.users = this.users.filter(u => u.ident !== tempUser.ident);
        this.$mdToast.show(toastCreator('The user has been removed'));
      } catch (err) {
        console.log(err);
        this.$mdToast.show(toastCreator('A technical issue prevented the user from being removed.'));
      }
    };
  
    this.passDelete = () => deleteUser;
    $rootScope.$digest();
  }

  async userDiag($event, editUser, newUser = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: '<users-edit edit-user="editUser" new-user="newUser" user-delete="userDelete" projects="projects" access-group="accessGroup" self-edit="selfEdit"></user-edit>',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        locals: {
          editUser: angular.copy(editUser),
          newUser,
          userDelete: this.passDelete(),
          projects: this.projects,
          accessGroup: this.accessGroup,
          selfEdit: false,
        },
        /* eslint-disable no-shadow */
        controller: ['$scope', 'editUser', 'newUser', 'userDelete', 'projects', 'accessGroup', 'selfEdit',
          ($scope, editUser, newUser, userDelete, projects, accessGroup, selfEdit) => {
            $scope.editUser = editUser;
            $scope.newUser = newUser;
            $scope.userDelete = userDelete;
            $scope.projects = projects;
            $scope.accessGroup = accessGroup;
            $scope.selfEdit = selfEdit;
          }],
      });

      if (resp) {
        if (resp.message) {
          this.$mdToast.show(toastCreator(resp.message));
        }
        if (resp.data) {
          this.users.forEach((u, i) => {
            if (u.ident === resp.data.ident) {
              this.users[i] = resp.data;
            }
          });

          if (newUser) {
            this.users.push(resp.data);
            this.users = sortBy(this.users, 'username');
          }
        }
      }
    } catch (err) {
      this.$mdToast.show(toastCreator('The user has not been updated.'));
    }
  }
}

Users.$inject = ['$mdDialog', '$mdToast'];

export const UsersComponent = {
  template,
  controller: Users,
};

export default angular2react('users', UsersComponent, lazyInjector.$injector);
