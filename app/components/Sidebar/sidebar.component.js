/* eslint-disable class-methods-use-this */
import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import lazyInjector from '@/lazyInjector';
import template from './sidebar.pug';

import './sidebar.scss';

const bindings = {
  admin: '<',
};

class Sidebar {
  constructor() {
    // this.AclService = AclService;
    this.pageAccess = {};
  }
  
  async $onInit() {
    const pages = ['report', 'germline'];

    // pages.forEach(async (page) => {
    //   this.pageAccess[page] = await this.AclService.checkResource(page);
    //   $rootScope.$digest();
    // });

    this.maximized = false;

    $rootScope.$on('sidebarToggle', () => {
      this.maximized = !this.maximized;
    });
  }

  toggleNavbar() {
    this.maximized = !this.maximized;
    $rootScope.$emit('navbarToggle');
  }
}

export const SidebarComponent = { template, bindings, controller: Sidebar };
const reactComponent = angular2react('sidebar', SidebarComponent, lazyInjector.$injector);

export default reactComponent;
