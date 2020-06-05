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
import template from './sidebar.pug';

const bindings = {
  isAdmin: '<',
};

class Sidebar {
  /* @ngInject */
  constructor(AclService) {
    this.AclService = AclService;
    this.pageAccess = {};
  }
  
  async $onInit() {
    const pages = ['report', 'germline'];

    pages.forEach(async (page) => {
      this.pageAccess[page] = await this.AclService.checkResource(page);
      $rootScope.$digest();
    });

    this.maximized = getSidebarState();

    $rootScope.$on('sidebarToggle', () => {
      this.maximized = getSidebarState();
    });
  }

  toggleNavbar() {
    this.maximized = toggleSidebarState();
    $rootScope.$emit('navbarToggle');
  }
}

export const SidebarComponent = { template, bindings, controller: Sidebar };

export default angular2react('sidebar', Sidebar, lazyInjector.$injector);
