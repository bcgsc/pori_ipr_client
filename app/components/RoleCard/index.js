import toastCreator from '@/services/utils/toastCreator';
import dialogCreator from '@/services/utils/dialogCreator';
import template from './role-card.pug';
import './index.scss';

const bindings = {
  role: '<',
  removeEntry: '&',
};

class RoleCard {
  constructor($mdDialog, $mdToast, indefiniteArticleFilter) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.indefiniteArticleFilter = indefiniteArticleFilter;
  }

  async remove($event) {
    const confirm = dialogCreator(
      $event,
      `Are you sure you want to remove ${this.role.user.firstName} ${this.role.user.lastName} as ${this.indefiniteArticleFilter(this.role.role)} ${this.role.role}?`,
      'Are you sure you want to remove this user?',
      [{ text: 'Cancel', click: this.$mdDialog.cancel }, { text: 'Confirm', click: this.$mdDialog.hide }],
    );

    await this.$mdDialog.show(confirm);
    const role = angular.copy(this.role);
    this.$mdToast.show(toastCreator(
      `${role.user.firstName} ${role.user.lastName} has been removed as ${this.indefiniteArticleFilter(this.role.role)} ${role.role}.`,
    ));
    /* This syntax is really weird, but if anyone is interested: */
    /* Read about '&' binding for components in angularjs for why we pass an object back */
    this.removeEntry({ entry: this.role });
    
  }
}

RoleCard.$inject = ['$mdDialog', '$mdToast', 'indefiniteArticleFilter'];

export default {
  template,
  bindings,
  controller: RoleCard,
};
