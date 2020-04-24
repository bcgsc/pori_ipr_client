import orderBy from 'lodash.orderby';
import template from './projects-edit.pug';

const bindings = {
  editProject: '<',
  newProject: '<',
  projectDelete: '<',
  fullAccessUsers: '<',
};

class ProjectsEditComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, ProjectService, UserService, ReportService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.ProjectService = ProjectService;
    this.UserService = UserService;
    this.ReportService = ReportService;
  }

  $onInit() {
    this.oldProject = angular.copy(this.editProject); // record of old values for project for comparison
    
    // Creating new project
    if (this.newProject) {
      this.editProject = {
        name: '',
      };
    }

    this.editProject.users = orderBy(this.editProject.users, ['firstName']);
  }

  async isUniqueProject(searchText) {
    if (!searchText) {
      return;
    }

    const resp = await this.ProjectService.all({ admin: true });
    const allProjects = resp.map(proj => proj.name.toLowerCase());

    // If editing a project, don't check against own name
    if (!this.newProject) {
      allProjects.filter(p => p === this.oldProject.name.toLowerCase());
    }

    if (allProjects.includes(searchText.toLowerCase())) {
      this.form.Project.$setValidity('unique', false);
    } else {
      this.form.Project.$setValidity('unique', true);
    }
  }

  async searchUsers(searchText) {
    if (!searchText) {
      return [];
    }

    return this.UserService.search(searchText);
  }

  async searchReports(searchText) {
    if (!searchText) {
      return [];
    }
    const { reports } = await this.ReportService.allFiltered({ searchText, all: true });
    return reports;
  }

  cancel() {
    this.$mdDialog.cancel({ status: false, message: 'Could not update this project.' });
  }

  // Add user to project
  async addUser() {
    if (this.editProject.users.find(user => user.ident === this.member.ident)) {
      return this.$mdToast.showSimple('This user has already been added to the project');
    }

    // Add user to project
    const resp = await this.ProjectService.addUser(this.editProject.ident, this.member.ident);
    this.editProject.users.push(resp);

    this.member = null;
    this.searchQuery = '';
    this.$scope.$digest();
  }

  // Remove user from project
  async removeUser(user) {
    if (confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} from ${this.editProject.name}?`)) {
      await this.ProjectService.removeUser(this.editProject.ident, user.ident);
      // Remove entry from project list
      this.editProject.users = this.editProject.users.filter(u => u.ident !== user.ident);

      // If user is in full access group re-add to list with access flag
      if (this.fullAccessUsers.find(u => u.ident === user.ident)) {
        user.fullAccess = true;
        this.editProject.users.push(user);
      }

      this.editProject.users = orderBy(this.editProject.users, ['firstName']);
      this.$scope.$digest();
    }
  }

  // Add sample to project
  async addReport() {
    if (this.editProject.reports.find(report => report.ident === this.report.ident)) {
      return this.$mdToast.showSimple('This sample has already been added to the project');
    }

    // Add report to project
    await this.ProjectService.addReport(this.editProject.ident, this.report.ident);
    this.editProject.reports.push(this.report);

    this.report = null;
    this.searchReport = '';
    this.$scope.$digest();
  }

  // Remove sample from project
  async removeReport(report) {
    if (confirm(`Are you sure you want to remove ${report.patientId} from ${this.editProject.name}?`)) {
      await this.ProjectService.removeReport(this.editProject.ident, report.ident);
      // Remove entry from project list
      this.editProject.reports = this.editProject.reports.filter(r => r.ident !== report.ident);
      this.$scope.$digest();
    }
  }

  // Validate form and submit
  async update(form) {
    // Check for valid inputs by touching each entry
    if (form.$invalid) {
      form.$setDirty();
      form.$error.forEach((field) => {
        field.forEach((errorField) => {
          errorField.$setTouched();
        });
      });
      return;
    }
    
    // Send updated project to api
    if (!this.newProject) {
      const updatedProject = {
        ident: this.editProject.ident,
        name: this.editProject.name,
      };
      try {
        const project = await this.ProjectService.update(updatedProject);
        this.$mdDialog.hide({
          status: true,
          data: { ...this.editProject, ...project, users: this.editProject.users },
          message: 'The project has been updated!',
        });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not update this project.' });
      }
    }
    // Send updated project to api
    if (this.newProject) {
      try {
        const project = await this.ProjectService.add(this.editProject);
        this.$mdDialog.hide({
          status: true, data: { ...this.editProject, ...project }, message: 'The project has been added!', newProject: true,
        });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not add new project.' });
      }
    }
  }
}

export default {
  template,
  bindings,
  controller: ProjectsEditComponent,
};
