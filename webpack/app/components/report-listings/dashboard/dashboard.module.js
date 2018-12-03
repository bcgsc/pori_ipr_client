import angular from 'angular';
import DashboardComponent from './dashboard.component';

const DashboardModule = angular
  .module('dashboard', [])
  .component('dashboard', DashboardComponent)
  .name;

export default DashboardModule;
