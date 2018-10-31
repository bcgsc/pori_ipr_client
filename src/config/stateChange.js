app.run(['$rootScope', '$state', '$q', '$acl', 'api.user', 'api.pog',
  '$userSettings', '_', '$mdToast', '$localStorage', ($rootScope, $state, $q, $acl,
    $user, $pog, $userSettings, _, $mdToast, $localStorage) => {
    // On State Change, Show Spinner!
    $rootScope.$on('$stateChangeStart', async (event, toState, toParams, fromState, fromParams) => {
      $rootScope.showLoader = true;

      $rootScope.PROJECT = CONFIG.PROJECT;
      $rootScope.CONFIG = CONFIG;

      $rootScope.SES_permissionResource = $acl.resource;
      $rootScope.SES_permissionAction = $acl.action;

      // Check for transitions among child states to run auth check
      // Transitions among top level states are checked by the router but not for child -> child
      if (fromState.name.match(/.*(?=\.)/g) === toState.name.match(/.*(?=\.)/g)) {
        try {
          await $user.me();
          await $userSettings.init();
          return $user.meObj;
        } catch (err) {
          Promise.reject(new Error(err.message));
          $state.go('public.login');
        }
      }
    });

    // On State Change Success, Hide Spinner!
    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
      $rootScope.showLoader = false;
    });

    $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
      try { // This try catch can be removed once all rejections return new Error('');
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
      } catch (err) {
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
