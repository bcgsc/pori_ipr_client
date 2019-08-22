import sortBy from 'lodash.sortby';
import template from './groups.pug';

const bindings = {
  groups: '<',
};

class GroupsComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, UserService, GroupService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.UserService = UserService;
    this.GroupService = GroupService;
  }

  async $onInit() {
    this.deleteGroup = async ($event, group) => {
      const confirm = this.$mdDialog.confirm()
        .title(`Are you sure you want to remove ${group.name}?`)
        .htmlContent(`Are you sure you want to remove the group <strong>${group.name}</strong>?<br/><br/>This will <em>not</em> affect access to any other BC GSC services.`)
        .ariaLabel('Remove Group?')
        .targetEvent($event)
        .ok('Remove Group')
        .cancel('Cancel');

      const resp = await this.$mdDialog.show(confirm);
      if (resp) {
        const tempGroup = angular.copy(group);
        try {
          // Remove User
          await this.GroupService.remove(group);
          this.groups = this.groups.filter(g => g.ident !== tempGroup.ident);
          this.$scope.$parent.groups = this.groups;
          this.$mdToast.show(this.$mdToast.simple('The group has been removed'));
        } catch (err) {
          this.$mdToast.show(this.$mdToast.simple('A technical issue prevented the group from being removed.'));
        }
      }
    };

    this.passDelete = () => {
      this.$mdDialog.hide(); // Hide any displayed dialog;
      return this.deleteGroup;
    };
  }

  async groupDiag($event, editGroup, newGroup = false) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: '<groups-edit class="adminSection" flex edit-group="editGroup" new-group="newGroup" group-delete="groupDelete($event, group)"></groups-edit>',
        clickOutsideToClose: true,
        locals: {
          editGroup: angular.copy(editGroup),
          newGroup,
          groupDelete: this.passDelete(),
        },
        /* eslint-disable no-shadow */
        controller: ($scope, editGroup, newGroup, groupDelete) => {
          'ngInject';

          $scope.editGroup = editGroup;
          $scope.newGroup = newGroup;
          $scope.groupDelete = groupDelete;
        },
      });
      this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
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
      this.$mdToast.show(this.$mdToast.simple().textContent('The group has not been updated.'));
    }
  }
}

export default {
  template,
  bindings,
  controller: GroupsComponent,
};
