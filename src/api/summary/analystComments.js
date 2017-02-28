/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.analystComments', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/POG';
  
  let $ac = {};
  
  
  /*
   * Get Analyst comments
   *
   * Retrieve anaylist comments for this POG
   *
   */
  $ac.get = (POGID) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/analystComments').then(
        (result) => {
          // Return to requestee
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        }
      );
      
    });
    
  }
  
  
  /*
   * Update an Analyst comment
   *
   * @param string POGID - POGID, eg POG129
   * @param string summary - Text body of summary
   *
   */
  $ac.update = (POGID, summary) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.put(api + '/' + POGID + '/summary/analystComments', summary).then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject();
        }
      );
    });
  }
  
  return $ac;
  
}]);
