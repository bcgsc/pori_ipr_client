import sortBy from 'lodash.sortby';
import template from './admin.pug';

const bindings = {
  groups: '<',
  users: '<',
  projects: '<',
};

class AdminComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.accessGroup = this.groups.find(group => group.name === 'Full Project Access');
  }

  async userDiag($event, editUser, newUser = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/admin/user/user.edit.html',
        clickOutToClose: false,
        locals: {
          editUser: angular.copy(editUser),
          newUser,
          userDelete: () => {},
          projects: this.projects,
          accessGroup: this.accessGroup,
          selfEdit: false,
        },
        controller: 'controller.dashboard.user.edit',
      });
      this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
      this.users.forEach((u, i) => {
        if (u.ident === resp.data.ident) {
          this.users[i] = resp.data;
        }
      });

      if (newUser) {
        this.users.push(resp.data);
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('The user has not been updated.'));
    }
  }

  async groupDiag($event, editGroup, newGroup = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/admin/user/group.edit.html',
        clickOutToClose: false,
        locals: {
          editGroup: angular.copy(editGroup),
          newGroup,
          groupDelete: () => {},
        },
        controller: 'controller.dashboard.user.groups.edit',
      });

      this.$mdToast.show(this.$mdToast.simple().textContent('The group has been added'));

      if (newGroup) {
        this.groups.push(resp.data);
        this.groups = sortBy(this.groups, 'name');
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('The group has not been updated.'));
    }
  }

  async projectDiag($event, editProject, newProject = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/admin/user/project.edit.html',
        clickOutToClose: false,
        locals: {
          editProject: angular.copy(editProject),
          newProject,
          projectDelete: () => {},
          fullAccessUsers: [],
        },
        controller: 'controller.dashboard.user.project.edit',
      });
      this.$mdToast.show(this.$mdToast.simple().textContent('The project has been added'));

      if (newProject) {
        this.projects.push(resp.data);
        this.projects = sortBy(this.projects, 'name');
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('The project has not been updated.'));
    }
  }
}

export default {
  bindings,
  template,
  controller: AdminComponent,
};
