/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.user', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/user';
  let _me = null; // Local user cache
  let _users = {} // Local users cache
  let _token = null; // User API token
  
  let $user = {};

  
  $user.me = () => {
    
    return $q((resolve, reject) => {
      
      if(_me) return resolve(_me);
      
      $http.get(api).then(
        (self) => {
          _me = self.data;
          _users[self.data.ident] = self;
          resolve(_me);
        },
        (error) => {
          reject(error);
        }
      );
      
    });
    
  }
  
  
  return $user;
  
}]);
