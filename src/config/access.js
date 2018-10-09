"use strict";

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
        config.headers.Authorization = keycloakAuth.getToken();
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
