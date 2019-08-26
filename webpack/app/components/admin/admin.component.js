import sortBy from 'lodash.sortby';
import template from './admin.pug';
import './admin.scss';

const bindings = {
  groups: '<',
  users: '<',
  projects: '<',
  isAdmin: '<',
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
        template: '<users-edit edit-user="editUser" new-user="newUser" user-delete="userDelete" projects="projects" access-group="accessGroup" self-edit="selfEdit"></user-edit>',
        clickOutToClose: false,
        locals: {
          editUser: angular.copy(editUser),
          newUser,
          userDelete: () => {},
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
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('The user has not been updated.'));
    }
  }

  async groupDiag($event, editGroup, newGroup = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: '<groups-edit class="adminSection" flex edit-group="editGroup" new-group="newGroup" group-delete="groupDelete($event, group)"></groups-edit>',
        clickOutToClose: false,
        locals: {
          editGroup: angular.copy(editGroup),
          newGroup,
          groupDelete: () => {},
        },
        /* eslint-disable no-shadow */
        controller: ($scope, editGroup, newGroup, groupDelete) => {
          'ngInject';

          $scope.editGroup = editGroup;
          $scope.newGroup = newGroup;
          $scope.groupDelete = groupDelete;
        },
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
        template: '<projects-edit edit-project="editProject" new-project="newProject" project-delete="projectDelete" full-access-users="fullAccessUsers"> </projects-edit>',
        clickOutToClose: false,
        locals: {
          editProject: angular.copy(editProject),
          newProject,
          projectDelete: () => {},
          fullAccessUsers: [],
        },
        /* eslint-disable no-shadow */
        controller: ($scope, editProject, newProject, projectDelete, fullAccessUsers) => {
          'ngInject';

          $scope.editProject = editProject;
          $scope.newProject = newProject;
          $scope.projectDelete = projectDelete;
          $scope.fullAccessUsers = fullAccessUsers;
        },
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
