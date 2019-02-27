import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import angularMoment from 'angular-moment';
import DiscussionEntryComponent from './discussion-entry.component';

angular.module('discussionentry', [
  uiRouter,
  angularMoment,
]);

export default angular.module('discussionentry')
  .component('discussionEntry', DiscussionEntryComponent)
  .name;
