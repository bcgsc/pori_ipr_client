/* /src/config/application.js */
app.run(
  ['$rootScope', '$state', '$location', '$q', '$acl', '$cookies', 'api.user', 'api.pog', '$userSettings', '_', '$mdToast', '$localStorage',
    ($rootScope, $state, $location, $q, $acl, $cookies, $user, $pog, $userSettings, _, $mdToast, $localStorage) => {
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
            $rootScope.returnToState = toState.name; // setting state to return to
            $rootScope.returnToStateParams = toParams; // setting params of state to return to
            event.preventDefault();
            // $cookies.remove(CONFIG.COOKIES.KEYCLOAK); // transitioning with an invalid token creates an infinite loop, so delete
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
              .then((resp) => {
                // Session init'd, return user
                $userSettings.init(); // Init settings
                // Check if user is internal or external on refresh
                $rootScope.isExternalMode = _.find(_.mapValues(resp.groups, (r) => {
                  return { name: r.name.toLowerCase() };
                }), { 'name': 'clinician' }) || _.find(_.mapValues(resp.groups, (r) => {
                  return { name: r.name.toLowerCase() };
                }), { 'name': 'collaborator' });

                // User is logged in - check if accessing individual POG
                if (toParams.POG) {
                  resolve($acl.canAccessPOG(toParams.POG));
                }
                // Not accessing specific case - can go ahead and resolve
                resolve();
              })
              .catch((err) => {
                $rootScope.returnToState = toState.name;
                $rootScope.returnToStateParams = toParams;
                switch (err) {
                  case 'AuthTokenError':
                    // No session, go to login page
                    $state.go('public.login');
                    resolve();
                    break;
                  case 'projectAccessError':
                    // Not allowed to access project - return to dashboard
                    $mdToast.showSimple('You do not have access to cases in this project');
                    $state.go('dashboard.home');
                    resolve();
                    break;
                  default:
                    $state.go('public.login');
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
    }]
);

app.config(($mdDateLocaleProvider) => {
  $mdDateLocaleProvider.formatDate = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '';
  };
});
