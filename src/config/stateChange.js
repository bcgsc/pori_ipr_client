app.run(['$rootScope', '$state', '$q', '$acl', '$cookies', 'api.user', 'api.pog',
  '$userSettings', '_', '$mdToast', '$localStorage', ($rootScope, $state, $q, $acl,
    $cookies, $user, $pog, $userSettings, _, $mdToast, $localStorage) => {
    // On State Change, Show Spinner!
    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
      $rootScope.showLoader = true;

      $rootScope.PROJECT = CONFIG.PROJECT;
      $rootScope.CONFIG = CONFIG;

      $rootScope.SES_permissionResource = $acl.resource;
      $rootScope.SES_permissionAction = $acl.action;
    });

    // On State Change Success, Hide Spinner!
    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
      $rootScope.showLoader = false;
    });

    $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
      switch (error.message) {
        case 'externalModeError':
          $state.go('dashboard.reports.genomic'); // transition to genomic report state
          break;
        case 'projectAccessError':
          $mdToast.showSimple('You do not have access to cases in this project');
          $state.go('dashboard.home');
          break;
        default:
          console.log('State Change Error:', event, toState, toParams);
          $localStorage.returnToState = toState.name;
          $localStorage.returnToStateParams = JSON.stringify(toParams);
          $state.go('public.login');
      }

      $rootScope.showLoader = false;
    });
  }]);

app.config(($mdDateLocaleProvider) => {
  $mdDateLocaleProvider.formatDate = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '';
  };
});
