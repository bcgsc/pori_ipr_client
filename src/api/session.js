/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.session', ['_', '$http', '$q', '$cookies', 'api.user', 'api.pog', (_, $http, $q, $cookies, $user, $pog) => {
  
  const localStorageKey = 'BCGSC_SSO';  // Local Storage Token Key
  const api = CONFIG.ENDPOINTS.API + '/session';   // API Namespace setting
  
  let _token = null,        // User API token
      initialized = false,  // Set initialization status
      me = null,            // Local lib cache
      $session = {};        // Session lib
  
  
  /*
   * Retrieve local me
   *
   * Return the session API local copy of me object
   *
   */
  $session.user = () => {
    return me;
  };

  $session.getToken = () => {
    return angular.copy(_token);
  };
  
  /*
   * Retrieve local me promise
   *
   * Takes the user() function above and wraps it in promise
   * for the patient functions.
   *
   */
  $session.$user = () => {
    // Wrap local me in Q promise so it can wait...
    return $q.when($session.user());
  };
  
  /*
   * Store session data
   *
   * Store local and other session data
   *
   */ 
  $session.store = (token, user) => {
    $cookies.set(localStorageKey, token); // Set token on client storage for session permanence
    $http.defaults.headers.common.Authorization = token; // Set $http header token
    me = user; // Set lib cache
  };
  
  /*
   * Initialize session
   *
   * Look for active session token and initialize!
   *
   */
  $session.init = () => {
    
    return $q((resolve, reject) => {
    
      // Are we already initialized?
      if(initialized === true) resolve(me);
      
      // Retrieve token from local storage
      let token = $localStorage[localStorageKey];
      _token = token; // Set local cache.
      
      // Token exists?
      if(token === false || token === undefined || token === null) {
        reject('AuthTokenError');
      }
      
      $http.defaults.headers.common['Authorization'] = token;
      
      // We've got a session token, lets try and get account details
      $user.me()
        .then((me) => {
          // Got a good token, store local
          $session.store(token, me);
          resolve(me);
        })
        .catch((err) => {
          console.log('Failed to retrieve user following session init', err);
          reject({message: 'Failed to initialize session'});
        });
      
    });
    
  };
  
  /*
   * User login attempt
   *
   * Attempt to validated provided credentials against the API.
   *
   */
  $session.login = (username, password) => {
    
    return $q((resolve, reject) => {
      
      // Make http API call
      $http.post(api + '/', {username: username, password: password})
        .then((resp) => {
          // Successful authentication
          // Check token from header
          _token =  resp.headers('X-Token'); // Retrieve token from response
          
          $localStorage[localStorageKey] = _token; // Set token on client storage for session permanence
          $http.defaults.headers.common['Authorization'] = _token; // Set $http header token
          
          //$session.store(_token, resp.data); // Store response!
          
          $user.meObj = resp.data;
          
          resolve(resp);
          
        })
        .catch((error) => {
          console.log('Reject login attempt', error);
          reject(error);
        });
      
    });
    
  };
  
  /*
   * End Session
   *
   * Destroy either current or all sessions
   *
   */
  $session.logout = (all=false) => {

    let deferred = $q.defer();



    // Logout of all?
    if(all === true) {
      // Session destroy all keys
    }
    
    if(all === false) {
      // Session destroy this key

      $http.delete(api + '/').then(
        (resp) => {

          // Local logout
          delete $localStorage[localStorageKey]; // Remove localStorage entry
          me = null; // Reset lib cache
          $user.meObj = null; // Reset $user lib cache
          $user._token = null; // Reset $user lib token
          _token = null; // Reset lib token cache
          delete $http.defaults.headers.common['Authorization']; // Remove authorization token entry

          deferred.resolve(true);
        },
        (err) => {
          console.log(err);
          deferred.reject({status: false, message: 'Unable to destroy API token.'});
        }
      );

    }

    return deferred.promise;
    
  };
  
  
  return $session;
  
}]);
