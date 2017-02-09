/* /src/config/application.js */
app.run(($rootScope) => {
  
  
  // On State Change, Show Spinner!
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    //$rootScope.showLoader = true;
  });
  
  // On State Change Success, Hide Spinner!
  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    //$rootScope.showLoader = false;
  });
  
  
  
});


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