import { angular2react } from 'angular2react';

import toastCreator from '@/utils/toastCreator';
import dialogCreator from '@/utils/dialogCreator';
import GroupService from '@/services/management/group.service';
import lazyInjector from '@/lazyInjector';

import sortBy from 'lodash.sortby';
import template from './groups.pug';

class Groups {
  constructor($mdDialog, $mdToast, $scope) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
  }

  async $onInit() {
    this.groups = await GroupService.all();
    this.deleteGroup = async ($event, group) => {
      const confirm = dialogCreator({
        $event,
        title: `Are you sure you want to remove ${group.name}?`,
        text: `
          Are you sure you want to remove the group <strong>${group.name}</strong>?<br/><br/>This will <em>not</em> affect access to any other BC GSC services.
        `,
        actions: [{ click: this.$mdDialog.cancel, text: 'Cancel' }, { click: this.$mdDialog.hide, text: 'Remove Group' }],
      });

      const resp = await this.$mdDialog.show(confirm);
      if (resp) {
        const tempGroup = angular.copy(group);
        try {
          // Remove User
          await GroupService.remove(group);
          this.groups = this.groups.filter(g => g.ident !== tempGroup.ident);
          this.$scope.$parent.groups = this.groups;
          this.$mdToast.show(toastCreator('The group has been removed'));
        } catch (err) {
          this.$mdToast.show(toastCreator('A technical issue prevented the group from being removed.'));
        }
      }
    };

    this.passDelete = () => {
      this.$mdDialog.hide(); // Hide any displayed dialog;
      return this.deleteGroup;
    };

    this.$scope.$digest();
  }

  async groupDiag($event, editGroup, newGroup = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: '<groups-edit class="adminSection" flex edit-group="editGroup" new-group="newGroup" group-delete="groupDelete($event, group)"></groups-edit>',
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        locals: {
          editGroup: angular.copy(editGroup),
          newGroup,
          groupDelete: this.passDelete(),
        },
        /* eslint-disable no-shadow */
        controller: ['$scope', 'editGroup', 'newGroup', 'groupDelete', ($scope, editGroup, newGroup, groupDelete) => {
          $scope.editGroup = editGroup;
          $scope.newGroup = newGroup;
          $scope.groupDelete = groupDelete;
        }],
      });
      this.$mdToast.show(toastCreator(resp.message));
      this.groups.forEach((g, i) => {
        if (g.ident === resp.data.ident) {
          this.groups[i] = resp.data;
        }
      });

      if (newGroup) {
        this.groups.push(resp.data);
        this.groups = sortBy(this.groups, 'name');
        this.$scope.$parent.groups = this.groups;
      }
    } catch (err) {
      this.$mdToast.show(toastCreator('The group has not been updated.'));
    }
  }
}

Groups.$inject = ['$mdDialog', '$mdToast', '$scope'];

export const GroupsComponent = {
  template,
  controller: Groups,
};

export default angular2react('groups', GroupsComponent, lazyInjector.$injector);
