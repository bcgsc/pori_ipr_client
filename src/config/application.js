/* /src/config/application.js */
app.run(($rootScope) => {
  
  
  // On State Change, Show Spinner!
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    $rootScope.showLoader = true;
  });
  
  // On State Change Success, Hide Spinner!
  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    $rootScope.showLoader = false;

    // If toState
    if(toState.name === 'public.login') {
      setTimeout(() => {
        $rootScope.showLoader = false;
      }, 200);
    }

  });

  $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams) => {

    console.log('State Change Error:', event, toState, toParams);
    $rootScope.showLoader = false;

  });

  // Mount configuration
  $rootScope.PROJECT = CONFIG.PROJECT;
  
});

/*
app.factory('httpLoadSpinner', ['$q', '$rootScope', '$injector', ($q, $rootScope, $injector) => {

  return {
    'request': (config) => {
      $rootScope.showLoader = true;
      //console.log("Request Made", config);
      return config || $q.when(config);
    },
    'requestError': (rejection) => {
      console.log('Request Rejected');
    },
    'response': (resp) => {
      $rootScope.showLoader = false;
      //console.log('Successful request', resp);
      return resp || $q.when($resp);
    },
    'responseError': (rejection) => {
      return $q.reject(rejection);
    }
  }

}]);

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpLoadSpinner');
});
*/