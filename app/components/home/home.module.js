import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

const HomeModule = angular
  .module('home', [
    uiRouter,
  ])
  .config(($stateProvider) => {
    'ngInject';
    
    $stateProvider
      .state('root.home', {
        url: '/',
        template: '<div>Placeholder page</div>',
      });
  })
  .name;

export default HomeModule;
