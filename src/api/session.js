/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.session', ['_', '$http', '$q', '$localStorage', 'api.user', (_, $http, $q, $localStorage, $user) => {
  
  const localStorageKey = 'bcgscIprToken';  // Local Storage Token Key
  const api = 'http://localhost:8001/api/1.0' + '/session';   // API Namespace setting
  
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
  }
  
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
  }
  
  /*
   * Store session data
   *
   * Store local and other session data
   *
   */ 
  $session.store = (token, user) => {
    
    $localStorage[localStorageKey] = token; // Set token on client storage for session permanence
    $http.defaults.headers.common['Authorization'] = token; // Set $http header token
    me = user; // Set lib cache
    
    return;
  }
  
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
      
      // Token exists?
      if(token === false || token === undefined || token === null) {
        reject('No auth token');
      }
      
      $http.defaults.headers.common['Authorization'] = token;
      
      // We've got a session token, lets try and get account details
      $user.me().then((me) => {
        // Got a good token, store local
        $session.store(token, me);
        resolve(me);
        
      }, (error) => {
        // Problem! Bad token
        reject(error);
      });
      
    });
    
  }
  
  /*
   * User login attempt
   *
   * Attempt to validated provided credentials against the API.
   *
   */
  $session.login = (username, password) => {
    
    return $q((resolve, reject) => {
      
      // Make http API call
      $http.post(api + '/', {username: username, password: password}).then(
        (resp) => {
          // Successful authentication
          // Check token from header
          _token =  resp.headers('X-Token'); // Retrieve token from response 
          $session.store(_token, resp.data); // Store response!
          
          // Resolve
          resolve($session.user());
          
        },
        (error) => {
          reject(error);
        }
      );
      
    });
    
  }
  
  /*
   * End Session
   *
   * Destroy either current or all sessions
   *
   */
  $session.logout = (all=false) => {
    
    // Logout of all?
    if(all === true) {
      // Session destroy all keys
    }
    
    if(all === false) {
      // Session destroy this key
    }
    
    // Local logout
    delete $localStorage[localStorageKey]; // Remove localStorage entry
    me = null; // Reset lib cache
    $user.me = null; // Reset $user lib cache
    _token = null; // Reset lib token cache
    delete $http.defaults.headers.common['Authorization'] // Remove authorization token entry
    
    return;
    
  }
  
  
  return $session;
  
}]);
