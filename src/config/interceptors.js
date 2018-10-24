"use strict";

/**
 * HTTP Interceptors handler wrapper
 * @param {*} $rootScope {@link https://docs.angularjs.org/api/ng/service/$rootScope}
 * @param {*} $q {@link https://docs.angularjs.org/api/ng/service/$q}
 * @param {*} $injector {@link https://docs.angularjs.org/api/auto/service/$injector}
 * @return {Object} Error response handler
 */
function httpInterceptors($rootScope, $q, $injector, $timeout) {
  /**
   * Response Error response handler
   *
   * @param {object} response - $http response object
   */
  return {
    request: (config) => {
      const keycloakAuth = $injector.get('keycloakAuth');
      if (keycloakAuth.getToken()) {
        config.headers.Authorization = keycloakAuth.getToken();
      }
      return config;
    },

    responseError: (response) => {
      switch (response.status) {
        case 500:
          $rootScope.$broadcast('httpError', { message: 'An unexpected error has occurred. Please try again.' });
          break;
        case 403:
          if (response.data.message === 'IPR Access Error') {
            const keycloakAuth = $injector.get('keycloakAuth');
            $rootScope.$broadcast('httpError', { message: 'IPR Access Error. External users: contact GSC Systems for access. Internal users: create a DEVSU JIRA ticket requesting access' });
            $timeout(() => { keycloakAuth.logout(); }, 10000);
            break;
          }
          $rootScope.$broadcast('httpError', { message: 'You are not authorized to access the requested resource.' });
          break;
        case -1:
          $rootScope.$broadcast('httpError', { message: 'The API server was not able to process the request. See console for details' });
          break;
        default:
          break;
      }
    
      return $q.reject(response);
    },
  };
}

httpInterceptors.$inject = ['$rootScope', '$q', '$injector', '$timeout'];

angular
  .module('bcgscIPR')
  .factory('httpInterceptors', httpInterceptors)
  .config(['$httpProvider', ($httpProvider) => {
    // Add Error Interceptors Wrapper
    $httpProvider.interceptors.push('httpInterceptors');
  }]);
