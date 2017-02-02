/* /src/config/application.js */
app.run(($rootScope) => {
  
  
  // On State Change, Show Spinner!
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    $rootScope.showLoader = true;
  });
  
  // On State Change Success, Hide Spinner!
  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    $rootScope.showLoader = false;
  });
  
  
  
});
