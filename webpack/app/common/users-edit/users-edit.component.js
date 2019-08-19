import differenceBy from 'lodash.differenceby';
import template from './users-edit.pug';

const bindings = {
  editUser: '<',
  newUser: '<',
  userDelete: '<',
  projects: '<',
  accessGroup: '<',
  selfGroup: '<',
};

class UserEditComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, UserService, ProjectService, GroupService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.UserService = UserService;
    this.ProjectService = ProjectService;
    this.GroupService = GroupService;
  }

  $onInit() {
    this.projectAccess = {
      projects: this.editUser.projects,
      allProjectAccess: !!(this.editUser.groups.find(group => group.ident === this.accessGroup.ident)),
    };

    // Creating new user
    if (this.newUser) {
      this.user = {
        username: '',
        type: 'bcgsc',
        firstName: '',
        lastName: '',
      };
    } else {
      this.user = this.editUser;
    }
  }

  cancel() {
    this.$mdDialog.cancel({ status: false, message: 'Could not update this user.' });
  }

  async update(form) {
    // Check for valid inputs by touching each entry
    if (form.$invalid) {
      form.$setDirty();
      angular.forEach(form.$error, (field) => {
        angular.forEach(field, (errorField) => {
          errorField.$setTouched();
        });
      });
      return;
    }

    // Send updated user to api
    if (!this.newUser) {
      // update user/project binding if not self editing
      if (!this.selfEdit) {
        if (this.projectAccess.allProjectAccess) { // if full access, add to group
          // check if user is already part of full access group
          if (!this.user.groups.find(group => group.name === this.accessGroup.name)) {
            // add to group
            try {
              await this.GroupService.addUser(this.accessGroup.ident, this.user.ident);
            } catch (err) {
              this.$mdToast.showSimple('User was not given full project access.');
            }
          }
        } else {
          // if not full access, bind to/unbind from projects
          // check if user is part of full access group
          if (this.user.groups.find(group => group.name === this.accessGroup.name)) {
            // remove from group
            try {
              await this.GroupService.removeUser(this.accessGroup.ident, this.user.ident);
            } catch (err) {
              this.$mdToast.showSimple('User was not removed from full project access.');
            }
          }

          // unbind from projects no longer in list
          const unbind = differenceBy(this.user.projects, this.projectAccess.projects, 'name');
          unbind.forEach(async (project) => {
            try {
              await this.ProjectService.removeUser(project.ident, this.user.ident);
            } catch (err) {
              this.$mdToast.showSimple(`User was not removed from project ${project.name}`);
              console.error('Unable to remove user from project', err);
            }
          });

          // bind to new projects in list
          const bind = differenceBy(this.projectAccess.projects, this.user.projects, 'name');
          bind.forEach(async (project) => {
            try {
              await this.ProjectService.addUser(project.ident, this.user.ident);
            } catch (err) {
              this.$mdToast.showSimple(`User was not added to project ${project.name}`);
              console.error('Unable to add user to project', err);
            }
          });
        }
      }
      // update user
      try {
        await this.UserService.update(this.user);
        // Update user projects
        this.user.projects = this.projectAccess.projects;

        // Update user groups
        if (this.projectAccess.allProjectAccess
          && !this.user.groups.find(group => group.name === this.accessGroup.name)
        ) {
          this.user.groups.push(this.accessGroup);
        }
        if (!this.projectAccess.allProjectAccess
          && this.user.groups.find(group => group.name === this.accessGroup.name)
        ) {
          this.user.groups.filter(group => group.name === this.accessGroup.name);
        }

        // Success - return updated user
        this.$mdDialog.hide({ status: true, data: this.user, message: 'User has been updated!' });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not update this user.' });
      }
      return;
    }

    // Send new user to api
    if (this.newUser) {
      // create user
      const user = await this.UserService.create(this.user);
      // create user/project binding
      if (this.projectAccess.allProjectAccess) { // if full access, add to group
        // Add user to group
        try {
          await this.GroupService.addUser(this.accessGroup.ident, user.ident);
        } catch (err) {
          this.$mdToast.showSimple('User was not given full project access.');
        }
      } else { // if not full access, bind to projects
        this.projectAccess.projects.forEach(async (project) => {
          try {
            await this.ProjectService.addUser(project.ident, user.ident);
          } catch (err) {
            this.$mdToast.showSimple(`User was not added to project ${project.name}`);
            console.error('Unable to add user to project', err);
          }
        });
      }

      // Add user projects
      user.projects = this.projectAccess.projects;

      // Add user group
      if (this.projectAccess.allProjectAccess) {
        user.groups = [this.accessGroup];
      }

      // Success - return newly added user
      this.$mdDialog.hide({
        status: true, data: user, message: 'User has been added!', useUser: true,
      });
    }
  }
}

export default {
  template,
  bindings,
  controller: UserEditComponent,
};
