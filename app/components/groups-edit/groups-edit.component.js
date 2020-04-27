import template from './groups-edit.pug';

const bindings = {
  editGroup: '<',
  newGroup: '<',
  groupDelete: '&',
};

class GroupsEditComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, UserService, GroupService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.UserService = UserService;
    this.GroupService = GroupService;
  }

  $onInit() {
    // Creating new user
    if (this.newGroup) {
      this.editGroup = {
        name: '',
      };
    }
  }

  async searchUsers(searchText) {
    if (!searchText) {
      return [];
    }

    return this.UserService.search(searchText);
  }

  async searchOwner(searchOwnerText) {
    if (!searchOwnerText) {
      return [];
    }

    return this.UserService.search(searchOwnerText);
  }

  cancel() {
    this.$mdDialog.cancel({ status: false, message: 'Could not update this group.' });
  }

  /* eslint-disable consistent-return */
  async addUser() {
    if (this.editGroup.users.find(group => group.ident === this.member.ident)) {
      return alert('This user has already been added to the group');
    }
    try {
      // Add user to group
      const resp = await this.GroupService.addUser(this.editGroup.ident, this.member.ident);
      this.editGroup.users.push(resp);
      this.member = null;
      this.searchQuery = '';
      this.$scope.$digest();
    } catch (err) {
      console.log('Unable to add user', err);
    }
  }

  // Remove user from group
  async removeUser(user) {
    if (confirm(`Are you sure you want to remove '${user.firstName} ${user.lastName} from ${this.editGroup.name}?`)) {
      try {
        await this.GroupService.removeUser(this.editGroup.ident, user.ident);
        // Remove entry from group list
        this.editGroup.users = this.editGroup.users.filter(u => u.ident !== user.ident);
        this.$scope.$digest();
      } catch (err) {
        console.log('Unable to remove user from group', err);
      }
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

    this.editGroup.owner = this.editGroup.owner.ident;
    
    // Send updated user to api
    if (!this.newGroup) {
      try {
        const group = await this.GroupService.update(this.editGroup.ident, this.editGroup);
        this.$mdDialog.hide({ status: true, data: group, message: 'The group has been updated!' });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not update this group.' });
      }
    }
    // Send updated user to api
    if (this.newGroup) {
      try {
        const group = await this.GroupService.create(this.editGroup);
        this.$mdDialog.hide({
          status: true, data: group, message: 'The group has been added!', newGroup: true,
        });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not update this group.' });
      }
    }
  }
}

export default {
  template,
  bindings,
  controller: GroupsEditComponent,
};
