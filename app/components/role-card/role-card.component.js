import template from './role-card.pug';
import './role-card.scss';

const bindings = {
  role: '<',
  removeEntry: '&',
};

class RoleCardComponent {
  /* @ngInject */
  constructor($mdDialog, $mdToast, indefiniteArticleFilter) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.indefiniteArticleFilter = indefiniteArticleFilter;
  }

  async remove($event) {
    const confirm = this.$mdDialog.confirm()
      .title('Are you sure you want to remove this user?')
      .textContent(
        `Are you sure you want to remove ${this.role.user.firstName} ${this.role.user.lastName} as ${this.indefiniteArticleFilter(this.role.role)} ${this.role.role}?`,
      )
      .ariaLabel('Confirm remove user')
      .targetEvent($event)
      .ok('Confirm')
      .cancel('Cancel');

    await this.$mdDialog.show(confirm);
    const role = angular.copy(this.role);
    this.$mdToast.show(this.$mdToast.simple().textContent(
      `${role.user.firstName} ${role.user.lastName} has been removed as ${this.indefiniteArticleFilter(this.role.role)} ${role.role}.`,
    ));
    /* This syntax is really weird, but if anyone is interested: */
    /* Read about '&' binding for components in angularjs for why we pass an object back */
    this.removeEntry({ entry: this.role });
  }
}

export default {
  template,
  bindings,
  controller: RoleCardComponent,
};
