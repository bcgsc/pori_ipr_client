/* eslint-disable class-methods-use-this */
import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';
import { StateService as $state } from '@uirouter/angularjs';
import { $mdDialog, $mdToast } from 'angular-material';

import lazyInjector from '@/lazyInjector';
import {
  getCurrentUser,
  getSidebarState,
  toggleSidebarState,
} from '@/services/management/user.service';
import { logout } from '@/services/management/keycloak.service';
import template from './navbar.pug';
import feedbackTemplate from './feedback/feedback.pug';
import feedbackController from './feedback/feedback';

class NavBar {
  // CONFIG and VERSION are injected with webpack
  async $onInit() {
    this.user = await getCurrentUser();
    this.config = CONFIG.ATTRS.name;
    this.version = VERSION;
    this.maximized = getSidebarState();
    $rootScope.$digest();

    $rootScope.$on('navbarToggle', () => {
      this.maximized = getSidebarState();
    });
  }

  toggleSidebar() {
    this.maximized = toggleSidebarState();
    $rootScope.$emit('sidebarToggle');
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
      $mdToast.showSimple('Error: Could not logout due to connection issue.');
      $state.go('public.login');
    }
  }
}

export const NavBarComponent = { template, controller: NavBar };

export default angular2react('navBar', NavBarComponent, lazyInjector.$injector);
