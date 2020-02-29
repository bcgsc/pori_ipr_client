import template from './discussion.pug';
import './discussion.scss';

const bindings = {
  pog: '<',
  report: '<',
  discussions: '<',
  user: '<',
};

class DiscussionComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, DiscussionService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.DiscussionService = DiscussionService;
  }

  $onInit() {
    this.new = { body: null };
  }
  
  async add() {
    const data = {
      body: this.new.body,
    };
    try {
      const resp = await this.DiscussionService.create(this.pog.POGID, this.report.ident, data);
      this.discussions.push(resp);
      this.new.body = null;
      this.$scope.$digest();
    } catch (err) {
      this.$mdToast.showSimple('Unable to add new discussion entry');
    }
  }
}

export default {
  template,
  bindings,
  controller: DiscussionComponent,
};
