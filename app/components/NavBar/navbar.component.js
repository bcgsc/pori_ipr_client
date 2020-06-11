import { angular2react } from 'angular2react';
import { StateService as $state } from '@uirouter/angularjs';
import { $mdDialog, $mdToast } from 'angular-material';

import lazyInjector from '@/lazyInjector';
import { logout } from '@/services/management/auth';
import template from './navbar.pug';
import feedbackTemplate from './feedback/feedback.pug';
import feedbackController from './feedback/feedback';

import './navbar.scss';

const bindings = {
  sidebarMaximized: '<',
  setSidebarMaximized: '<',
  user: '<',
};

class NavBar {
  // CONFIG and VERSION are injected with webpack
  async $onInit() {
    this.config = CONFIG.ATTRS.name;
    this.version = VERSION;
  }

  toggleSidebar() {
    this.setSidebarMaximized(!this.sidebarMaximized);
  }

  async openFeedback($event) {
    await $mdDialog.show({
      controller: feedbackController,
      template: feedbackTemplate,
      targetEvent: $event,
      clickOutsideToClose: true,
    });
  }

  async userLogout() {
    try {
      await logout();
      $mdToast.showSimple('You have been logged out.');
    } catch (err) {
      console.error(err);
      $mdToast.showSimple('Error: Could not logout due to connection issue.');
      $state.go('public.login');
    }
  }
}

export const NavBarComponent = { template, bindings, controller: NavBar };

export default angular2react('navBar', NavBarComponent, lazyInjector.$injector);
