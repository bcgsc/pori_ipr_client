import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import lazyInjector from '@/lazyInjector';
import AclService from '@/services/management/acl.service';
import template from './sidebar.pug';

import './sidebar.scss';

const bindings = {
  user: '<',
  admin: '<',
  sidebarMaximized: '<',
  setSidebarMaximized: '<',
};

class Sidebar {
  constructor($window) {
    this.$window = $window;
    this.pageAccess = {};
    this.pages = ['report', 'germline'];
    this.config = CONFIG;
  }

  async $onChanges(changes) {
    if (changes.user && !changes.user.isFirstChange()) {
      this.pages.forEach(async (page) => {
        this.pageAccess[page] = await AclService.checkResource(page, this.user);
        $rootScope.$digest();
      });
    }
  }

  toggleSidebar() {
    this.setSidebarMaximized(!this.sidebarMaximized);
  }
}

Sidebar.$inject = ['$window'];

export const SidebarComponent = { template, bindings, controller: Sidebar };

export default angular2react('sidebar', SidebarComponent, lazyInjector.$injector);
