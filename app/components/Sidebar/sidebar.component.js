import { angular2react } from 'angular2react';

import lazyInjector from '@/lazyInjector';
import template from './sidebar.pug';
import AclService from '@/services/management/acl.service';

import './sidebar.scss';

const bindings = {
  user: '<',
  admin: '<',
  sidebarMaximized: '<',
  setSidebarMaximized: '<',
};

class Sidebar {
  constructor() {
    this.AclService = new AclService();
    this.pageAccess = {};
    this.pages = ['report', 'germline'];
  }

  async $onChanges(changes) {
    if (changes.user && !changes.user.isFirstChange()) {
      this.pages.forEach(async (page) => {
        this.pageAccess[page] = await this.AclService.checkResource(page, this.user);
      });
    }
  }

  toggleSidebar() {
    this.setSidebarMaximized(!this.sidebarMaximized);
  }
}

export const SidebarComponent = { template, bindings, controller: Sidebar };
const reactComponent = angular2react('sidebar', SidebarComponent, lazyInjector.$injector);

export default reactComponent;
