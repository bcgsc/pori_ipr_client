app.config(['$httpProvider', ($httpProvider) => {
  
  // Configure interceptor for 403 responses from API
  $httpProvider.interceptors.push(['$q', '$injector', '$window', ($q, $injector, $window) => {
    
    return {
      // Build Error Response Handler
      responseError: (responseError) => {

        let $state = $injector.get('$state');

        // API Is not Available
        if(responseError.status === -1) {
          $state.go('error.500');
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
