import { $rootScope } from 'ngimport';

import toastCreator from '@/services/utils/toastCreator';
import DiscussionService from '@/services/reports/discussion.service';
import template from './discussion-entry.pug';
import './index.scss';

const bindings = {
  patient: '<',
  report: '<',
  entry: '<',
  user: '<',
};

class DiscussionEntry {
  constructor($mdToast) {
    this.$mdToast = $mdToast;
  }

  $onInit() {
    this.editing = false;
    this.entryCache = null;
    this.removed = false;
  }

  // Canceling edit / restoring previous state
  cancelEdit() {
    this.entry.body = this.entryCache;
    this.entryCache = null;
    this.editing = false;
  }

  // Enable editing mode
  edit() {
    this.entryCache = angular.copy(this.entry.body);
    this.editing = true;
  }

  // Trigger save
  async save() {
    try {
      const resp = await DiscussionService.update(
        this.report.ident, this.entry.ident, { body: this.entry.body },
      );
      this.entry = resp;
      this.editing = false;
      this.entryCache = null;
      $rootScope.$digest();
    } catch (err) {
      this.$mdToast.show(toastCreator('Unable to save the updated entry'));
    }
  }

  // Remove entry
  async remove() {
    try {
      await DiscussionService.remove(this.report.ident, this.entry.ident);
      this.removed = true;
      this.entry.body = null;
      this.editing = false;
    } catch (err) {
      this.editing = false;
    } finally {
      $rootScope.$digest();
    }
  }
}

DiscussionEntry.$inject = ['$mdToast'];

export default {
  template,
  bindings,
  controller: DiscussionEntry,
};
