import { $rootScope } from 'ngimport';

import template from './groups-edit.pug';
import UserService from '@/services/management/user.service';
import GroupService from '@/services/management/group.service';

const bindings = {
  editGroup: '<',
  newGroup: '<',
  groupDelete: '&',
};

class GroupsEdit {
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
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

    return UserService.search(searchText);
  }

  async searchOwner(searchOwnerText) {
    if (!searchOwnerText) {
      return [];
    }

    return UserService.search(searchOwnerText);
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
      const resp = await GroupService.addUser(this.editGroup.ident, this.member.ident);
      this.editGroup.users.push(resp);
      this.member = null;
      this.searchQuery = '';
      $rootScope.$digest();
    } catch (err) {
      console.log('Unable to add user', err);
    }
  }

  // Remove user from group
  async removeUser(user) {
    if (confirm(`Are you sure you want to remove '${user.firstName} ${user.lastName} from ${this.editGroup.name}?`)) {
      try {
        await GroupService.removeUser(this.editGroup.ident, user.ident);
        // Remove entry from group list
        this.editGroup.users = this.editGroup.users.filter(u => u.ident !== user.ident);
        $rootScope.$digest();
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
        const group = await GroupService.update(this.editGroup.ident, this.editGroup);
        this.$mdDialog.hide({ status: true, data: group, message: 'The group has been updated!' });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not update this group.' });
      }
    }
    // Send updated user to api
    if (this.newGroup) {
      try {
        const group = await GroupService.create(this.editGroup);
        this.$mdDialog.hide({
          status: true, data: group, message: 'The group has been added!', newGroup: true,
        });
      } catch (err) {
        this.$mdDialog.cancel({ status: false, message: 'Could not update this group.' });
      }
    }
  }
}

GroupsEdit.$inject = ['$mdDialog'];

export default {
  template,
  bindings,
  controller: GroupsEdit,
};
