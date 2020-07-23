import { $rootScope } from 'ngimport';
import { angular2react } from 'angular2react';

import { getUser } from '@/services/management/auth';
import toastCreator from '@/utils/toastCreator';
import lazyInjector from '@/lazyInjector';
import DiscussionService from '@/services/reports/discussion.service';
import template from './discussion.pug';
import './index.scss';

const bindings = {
  report: '<',
};

class Discussion {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.new = { body: null };
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      const promises = Promise.all([
        DiscussionService.all(this.report.ident),
        getUser(),
      ]);
      const [discussionsResp, userResp] = await promises;
      this.discussions = discussionsResp;
      this.user = userResp.user;
      $rootScope.$digest();
    }
  }

  async add() {
    const data = {
      body: this.new.body,
    };
    try {
      const resp = await DiscussionService.create(this.report.ident, data);
      this.discussions.push(resp);
      this.new.body = null;
      this.$mdToast.show(toastCreator('Entry added successfully'));
      $rootScope.$digest();
    } catch (err) {
      this.$mdToast.show(toastCreator('Unable to add new discussion entry'));
    }
  }
}

Discussion.$inject = ['$mdDialog', '$mdToast'];

export const DiscussionComponent = {
  template,
  bindings,
  controller: Discussion,
};

export default angular2react('discussion', DiscussionComponent, lazyInjector.$injector);
