"use strict";
/*
app.config(['$httpProvider', ($httpProvider) => {

  
  // Configure interceptor for 403 responses from API
  $httpProvider.interceptors.push(['$q', '$injector', '$window', ($q, $injector, $window) => {
    
    return {
      // Build Error Response Handler
      responseError: (responseError) => {

        let $state = $injector.get('$state');
        let $mdToast = $injector.get('$mdToast');
        
        // API Is not Available
        if(responseError.status === -1) {
          
          $mdToast().show($mdToast.simple().textContent('Uh oh! A system error prevented the request from processing.'));
          
          return $q.reject(responseError);
        }
        
        // Check if the response has a 403 error status
        if(responseError.status === 403) {
          
          // Get Route details
          let route = ($state.current && $state.current.name) ? $state.current.name : "invalud_path";
          
          // If the error happened on a public page, return the intercepted response.
          if(route.split('.')[0] === 'public') return $q.reject(responseError);
          
          // Bad Token or not logged in
          if(responseError.data.code == 'invalidAuthorizationToken') $state.go('public.login');
          
          // Otherwise, user is not permitted to perform this action, but is otherwise logged in
          return $q.reject(responseError);
        }

        if(responseError.status >= 400) {
          return $q.reject(responseError);
        }
        
      } // end ResponseError
    }; // end return
    
  }]);
  
}]);
*/

/**
 * HTTP Interceptors handler wrapper
 *
 * @param {object} $rootScope - Root scope object
 * @param {object} $q -
 *
 * @returns {{responseError: (function(*=))}}
 */
function httpInterceptors($rootScope, $q, $injector) {
  /**
   * Response Error response handler
   *
   * @param {object} response - $http response object
   */
  return {
    request: (config) => {
      const keycloakAuth = $injector.get('keycloakAuth');
      if (keycloakAuth.getToken() !== '') {
        config.headers.Authentication = keycloakAuth.getToken();
      }
      return config;
    },

    responseError: (response) => {
      console.log('Error triggered', response);
    
      switch (response.status) {
        case 500:
          console.log('500 Error');
          $rootScope.$broadcast('httpError', { message: 'An unexpected error has occurred. Please try again.' });
          break;
      
        case 405:
          console.log('405 error');
          break;
        case 403:
          console.log('Access Denied error');
          $rootScope.$broadcast('httpError', { message: 'You are not authorized to access the requested resource.' });
          break;
        case -1:
          console.log('API Request failed', response);
          $rootScope.$broadcast('httpError', { message: 'The API server was not able to process the request. See console for details' });
          break;
        default:
          break;
      }
    
      return $q.reject(response);
    },
  };
}

app.config(['$httpProvider', ($httpProvider) => {
  // Add Error Interceptors Wrapper
  $httpProvider.interceptors.push('httpInterceptors');
}]);

// Create Interceptors Factory
app.factory('httpInterceptors', httpInterceptors);

// Inject dependencies into wrapper
httpInterceptors.$inject = ['$rootScope', '$q', '$injector'];
