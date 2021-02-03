import { angular2react } from 'angular2react';

import toastCreator from '@/utils/toastCreator';
import lazyInjector from '@/lazyInjector';
import { logout } from '@/services/management/auth';
import template from './navbar.pug';
import feedbackTemplate from '../Feedback/feedback.pug';
import feedbackController from '../Feedback';

import './index.scss';

const bindings = {
  sidebarMaximized: '<',
  setSidebarMaximized: '<',
  user: '<',
};

class NavBar {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  // CONFIG and VERSION are injected with webpack
  async $onInit() {
    this.env = CONFIG.MISC.ENV;
    this.version = VERSION;
  }

  toggleSidebar() {
    this.setSidebarMaximized(!this.sidebarMaximized);
  }

  async openFeedback($event) {
    await this.$mdDialog.show({
      controller: feedbackController,
      template: feedbackTemplate,
      targetEvent: $event,
      clickOutsideToClose: true,
      parent: angular.element(document.body),
      bindToController: true,
      controllerAs: 'vm',
      locals: {
        CONTACT_EMAIL: window._env_.CONTACT_EMAIL,
        CONTACT_TICKET_URL: window._env_.CONTACT_TICKET_URL,
      },
    });
  }

  async userLogout() {
    try {
      await logout();
      this.$mdToast.show(toastCreator('You have been logged out.'));
    } catch (err) {
      console.error(err);
      this.$mdToast.show(toastCreator('Error: Could not logout due to connection issue.'));
    }
  }
}

NavBar.$inject = ['$mdDialog', '$mdToast'];

export const NavBarComponent = { template, bindings, controller: NavBar };

export default angular2react('navBar', NavBarComponent, lazyInjector.$injector);
