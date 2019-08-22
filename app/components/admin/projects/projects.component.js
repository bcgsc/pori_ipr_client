import sortBy from 'lodash.sortby';
import template from './projects.pug';

const bindings = {
  isAdmin: '<',
  projects: '<',
  groups: '<',
};

class ProjectComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, ProjectService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.accessGroup = this.groups.find(group => group.name === 'Full Project Access');

    // getting list of users with full access to display as project members
    this.fullAccessUsers = this.accessGroup.users.map((user) => {
      const fullAccessUser = user;
      fullAccessUser.fullAccess = true; // flag to prevent removal option
      return fullAccessUser;
    });

    this.projects.forEach((project) => {
      this.fullAccessUsers.forEach((user) => {
        // adding all access users to each projects list of users
        // if the user has full access but also belongs to project, dont replace so that we can allow "removal"
        if (!project.users.find(u => u.ident === user.ident)) {
          project.users.push(user);
        }
      });
    });

    this.deleteProject = async ($event, project) => {
      const confirm = this.$mdDialog.confirm()
        .title(`Are you sure you want to remove ${project.name}?`)
        .htmlContent(`Are you sure you want to remove the project <strong> ${project.name}</strong>?<br /><br />This will <em>not</em> affect access to any other BC GSC services.`)
        .ariaLabel('Remove Project?')
        .targetEvent($event)
        .ok('Remove Project')
        .cancel('Cancel');

      await this.$mdDialog.show(confirm);
      const tempProject = angular.copy(project);
      // Remove User
      try {
        await this.ProjectService.remove(project);
        this.projects = this.projects.filter(p => p.ident !== tempProject.ident);
        this.$scope.$parent.projects = this.projects;
        this.$mdToast.show(this.$mdToast.simple('The project has been removed'));
      } catch (err) {
        this.$mdToast.show(this.$mdToast.simple('Project service call to API failed'));
      }
    };

    // Function to pass into
    this.passDelete = () => {
      this.$mdDialog.hide(); // Hide any displayed dialog;
      return this.deleteProject;
    };
  }

  async projectDiag($event, editProject, newProject = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: '<projects-edit edit-project="editProject" new-project="newProject" project-delete="projectDelete" full-access-users="fullAccessUsers"> </projects-edit>',
        clickOutsideToClose: true,
        locals: {
          editProject: angular.copy(editProject),
          newProject,
          projectDelete: this.passDelete(),
          fullAccessUsers: this.fullAccessUsers,
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
      this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
      this.projects.forEach((p, i) => {
        if (p.ident === resp.data.ident) {
          this.projects[i] = resp.data;
        }
      });

      if (newProject) {
        this.projects.push(resp.data);
        this.projects = sortBy(this.projects, 'name');
        this.$scope.$parent.projects = this.projects;
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('The project has not been updated.'));
    }
  }
}
  
export default {
  template,
  bindings,
  controller: ProjectComponent,
};
