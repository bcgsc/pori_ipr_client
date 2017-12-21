/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.hook', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/tracking/hook';
  
  let $hook = {};
  
  
  /**
   * Get all tracking hooks
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $hook.all = (params=null) => {
    return $q((resolve, reject) => {
      
      $http.get(api, {params: params})
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  
  
  /**
   * Create new hook
   *
   * @param {object} hook - The hook to be created
   *
   * @returns {Promise} - Resolves with created object
   */
  $hook.create = (hook) => {
    return $q((resolve, reject) => {
      
      $http.post(api, hook)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  /**
   * Retrieve a single hook
   *
   * @param {string} ident - single UUID
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $hook.retrieve = (ident) => {
    return $q((resolve, reject) => {
      
      $http.get(`${api}/${ident}`)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  
  /**
   * Update an existing hook
   *
   * @param {string} ident - single UUID
   * @param {object} hook - the updated hook entry
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $hook.update = (ident, hook) => {
    return $q((resolve, reject) => {
      
      $http.put(`${api}/${ident}`, hook)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  /**
   * Remove a hook
   *
   * @param {string} ident - UUID of hook to be removed
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $hook.remove = (ident) => {
    return $q((resolve, reject) => {
      
      $http.delete(`${api}/${ident}`)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        })
    });
  };
  
  return $hook;
  
}]);
