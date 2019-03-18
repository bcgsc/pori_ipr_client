import template from './discussion-entry.pug';
import './discussion-entry.scss';

const bindings = {
  patient: '<',
  report: '<',
  entry: '<',
  user: '<',
};

class DiscussionEntryComponent {
  /* @ngInject */
  constructor($mdToast, DiscussionService, $scope) {
    this.$mdToast = $mdToast;
    this.DiscussionService = DiscussionService;
    this.$scope = $scope;
  }
  
  $onInit() {
    console.log(this.entry.createdAt);
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
      const resp = await this.DiscussionService.update(
        this.patient.POGID, this.report.ident, this.entry.ident, { body: this.entry.body },
      );
      this.entry = resp;
      this.editing = false;
      this.entryCache = null;
      this.$scope.$digest();
    } catch (err) {
      this.$mdToast.showSimple('Unable to save the updated entry');
    }
  }
  
  // Remove entry
  async remove() {
    try {
      await this.DiscussionService.remove(this.patient.POGID, this.report.ident, this.entry.ident);
      this.removed = true;
      this.entry.body = null;
      this.editing = false;
    } catch (err) {
      this.editing = false;
    } finally {
      this.$scope.$digest();
    }
  }
}

export default {
  template,
  bindings,
  controller: DiscussionEntryComponent,
};
