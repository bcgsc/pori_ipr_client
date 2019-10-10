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
        redirectTo: 'root.reportlisting.dashboard',
      });
  })
  .name;

export default HomeModule;
