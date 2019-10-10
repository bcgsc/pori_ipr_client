import angular from 'angular';
import DiscussionEntryComponent from './discussion-entry.component';

angular.module('discussionentry', []);

export default angular.module('discussionentry')
  .component('discussionEntry', DiscussionEntryComponent)
  .name;
