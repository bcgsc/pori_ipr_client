import angular from 'angular';

const HomeModule = angular
  .module('home', [])
  .config(($stateProvider) => {
    $stateProvider
      .state('root.home', {
        url: '/',
        redirectTo: 'root.report-listing.dashboard',
      });
  })
  .name;

export default HomeModule;
