import indefiniteArticle from '@/utils/indefiniteArticle';
import toastCreator from '@/utils/toastCreator';
import dialogCreator from '@/utils/dialogCreator';
import template from './role-card.pug';
import './index.scss';

const bindings = {
  role: '<',
  removeEntry: '&',
};

class RoleCard {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  async remove($event) {
    const confirm = dialogCreator({
      $event,
      text: `Are you sure you want to remove ${this.role.user.firstName} ${this.role.user.lastName} as ${indefiniteArticle(this.role.role)} ${this.role.role}?`,
      title: 'Are you sure you want to remove this user?',
      actions: [{ text: 'Cancel', click: this.$mdDialog.cancel }, { text: 'Confirm', click: this.$mdDialog.hide }],
    });

    await this.$mdDialog.show(confirm);
    const role = angular.copy(this.role);
    this.$mdToast.show(toastCreator(
      `${role.user.firstName} ${role.user.lastName} has been removed as ${indefiniteArticle(this.role.role)} ${role.role}.`,
    ));
    /* This syntax is really weird, but if anyone is interested: */
    /* Read about '&' binding for components in angularjs for why we pass an object back */
    this.removeEntry({ entry: this.role });
  }
}

RoleCard.$inject = ['$mdDialog', '$mdToast'];

export default {
  template,
  bindings,
  controller: RoleCard,
};
