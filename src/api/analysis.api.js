/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.analysis', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/analysis';
  
  let $analysis = {};
  
  /**
   * Get All Analyses
   *
   * Retrieve paginated analyses
   *
   * @param {object} params - URL parameters to append
   * @returns {promise} - Resolves with array of Analyses
   */
  $analysis.all = (params={}) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api, {params: params}).then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        }
      );
      
    });
    
  };
  
  
  /**
   * Add a new biopsy entry to API
   *
   * @param {object} data - New analysis object
   * @returns {*}
   */
  $analysis.add = (data) => {
    
    return $q((resolve, reject) => {
      
      $http.post(api, data)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
    
  };
  
  
  /**
   * Update biopsy analysis entry
   *
   * @param {object} data - Updated object payload
   * @returns {Promise/object} - Resolves with updated entry
   */
  $analysis.update = (data) => {
    return $q((resolve, reject) => {
      
      let payload = angular.copy(data);
      if(payload.analysis && Array.isArray(payload.analysis)) delete payload.analysis;
      
      $http.put(api + '/' + data.ident, payload)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  return $analysis;
  
}]);
