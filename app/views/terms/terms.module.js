import angular from 'angular';
import uiRouter from '@uirouter/angularjs/lib-esm';
import { react2angular } from 'react2angular';
import TermsComponent from './index';
import lazy from './lazy';

angular.module('terms', [
  uiRouter,
]);

export default angular.module('terms')
  .component('terms', react2angular(TermsComponent))
  .config(($stateProvider) => {
    'ngInject';

    Object.values(lazy).forEach(state => $stateProvider.state(state));
  })
  .name;
