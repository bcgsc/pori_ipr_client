/* /src/config/application.js */
app.run(['$rootScope', '$state', '$q', '$acl', '$cookies', 'api.user', 'api.pog',
  '$userSettings', '_', '$mdToast', '$localStorage', ($rootScope, $state, $q, $acl,
    $cookies, $user, $pog, $userSettings, _, $mdToast, $localStorage) => {
    // On State Change, Show Spinner!
    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
      $rootScope.showLoader = true;
    });

    // On State Change Success, Hide Spinner!
    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
      $rootScope.showLoader = false;

      // If toState
      if (toState.name === 'public.login') {
        setTimeout(() => {
          $rootScope.showLoader = false;
        }, 200);
      }
    });

    $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
      switch (error) {
        case 'externalModeError':
          event.preventDefault(); // cancel original state transition
          $state.go('dashboard.reports.genomic'); // transition to genomic report state
          break;
        default:
          console.log('State Change Error:', event, toState, toParams);
          $localStorage.returnToState = toState.name;
          $localStorage.returnToStateParams = JSON.stringify(toParams);
          event.preventDefault(); // Prevents transition from continuing
          $state.go('public.login');
      }

      $rootScope.showLoader = false;
    });

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
      // require login if not a state name starting w/ 'public'
      let loginRequired = true;
      const stateType = toState.name.split('.')[0];

      if (stateType === 'public') {
        loginRequired = false;
      }

      if (loginRequired) {
        return $q((resolve, reject) => {
          // Attempt session initialization
          $user.me()
            .then(() => {
              // Session init'd, return user
              $userSettings.init(); // Init settings
              // User is logged in - check if accessing individual POG
              if (toParams.POG) {
                resolve($acl.canAccessPOG(toParams.POG));
              }
              // Not accessing specific case - can go ahead and resolve
              resolve();
            })
            .catch((err) => {
              $localStorage.returnToState = toState.name;
              $localStorage.returnToStateParams = JSON.stringify(toParams);
              switch (err) {
                case 'projectAccessError':
                  // Not allowed to access project - return to dashboard
                  $mdToast.showSimple('You do not have access to cases in this project');
                  $state.go('dashboard.home');
                  resolve();
                  break;
                default:
                  reject(err);
                  break;
              }
            });
        });
      }
    });

    // Mount configuration
    $rootScope.PROJECT = CONFIG.PROJECT;
    $rootScope.CONFIG = CONFIG;

    $rootScope.SES_permissionResource = $acl.resource;
    $rootScope.SES_permissionAction = $acl.action;
  }]);

app.config(($mdDateLocaleProvider) => {
  $mdDateLocaleProvider.formatDate = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '';
  };
});
