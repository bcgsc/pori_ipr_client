import orderBy from 'lodash.orderby';

import toastCreator from '@/services/utils/toastCreator';
import UserService from '@/services/management/user.service';
import ProjectService from '@/services/management/project.service';
import ReportService from '@/services/reports/report.service';

import template from './projects-edit.pug';

const bindings = {
  editProject: '<',
  newProject: '<',
  projectDelete: '<',
  fullAccessUsers: '<',
};

class ProjectsEdit {
  constructor($scope, $mdDialog, $mdToast) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
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

    const resp = await ProjectService.all({ admin: true });
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
    const users = await UserService.search(searchText);
    return users;
  }

  async searchReports(searchText) {
    if (!searchText) {
      return [];
    }
    const { reports } = await ReportService.allFiltered({ searchText, all: true });
    return reports;
  }

  cancel() {
    this.$mdDialog.cancel({ status: false, message: 'Could not update this project.' });
  }

  // Add user to project
  async addUser() {
    if (this.editProject.users.find(user => user.ident === this.member.ident)) {
      return this.$mdToast.show(toastCreator('This user has already been added to the project'));
    }

    // Add user to project
    const resp = await ProjectService.addUser(this.editProject.ident, this.member.ident);
    this.editProject.users.push(resp);

    this.member = null;
    this.searchQuery = '';
    this.$mdToast.show(toastCreator('The user has been added to the project'));
    this.$scope.$digest();
  }

  // Remove user from project
  async removeUser($event, user) {
    if (confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} from ${this.editProject.name}?`)) {
      await ProjectService.removeUser(this.editProject.ident, user.ident);
      // Remove entry from project list
      this.editProject.users = this.editProject.users.filter(u => u.ident !== user.ident);

      // If user is in full access group re-add to list with access flag
      if (this.fullAccessUsers.find(u => u.ident === user.ident)) {
        user.fullAccess = true;
        this.editProject.users.push(user);
      }

      this.editProject.users = orderBy(this.editProject.users, ['firstName']);
      this.$mdToast.show(toastCreator('The user has been removed from the project'));
      this.$scope.$digest();
    }
  }

  // Add sample to project
  async addReport() {
    if (this.editProject.reports.find(report => report.ident === this.report.ident)) {
      return this.$mdToast.show(toastCreator('This sample has already been added to the project'));
    }

    // Add report to project
    await ProjectService.addReport(this.editProject.ident, this.report.ident);
    this.editProject.reports.push(this.report);

    this.report = null;
    this.searchReport = '';
    this.$mdToast.show(toastCreator('Report added'));
    this.$scope.$digest();
  }

  // Remove sample from project
  async removeReport(report) {
    if (confirm(`Are you sure you want to remove ${report.patientId} from ${this.editProject.name}?`)) {
      await ProjectService.removeReport(this.editProject.ident, report.ident);
      // Remove entry from project list
      this.editProject.reports = this.editProject.reports.filter(r => r.ident !== report.ident);
      this.$mdToast.show(toastCreator('Report removed'));
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
        const project = await ProjectService.update(updatedProject);
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
        const project = await ProjectService.add(this.editProject);
        this.$mdDialog.hide({
          status: true, data: { ...this.editProject, ...project }, message: 'The project has been added!', newProject: true,
        });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not add new project.' });
      }
    }
  }
}

ProjectsEdit.$inject = ['$scope', '$mdDialog', '$mdToast'];

export default {
  template,
  bindings,
  controller: ProjectsEdit,
};
