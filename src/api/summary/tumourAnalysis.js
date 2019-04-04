/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.tumourAnalysis', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/POG';
  
  let $ta = {};
  
  
  /*
   * Get Tumour Analysis
   *
   *
   */
  $ta.get = (POGID, report) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/tumourAnalysis').then(
        (result) => {
          // Load into cache
          
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
   * Update Tumour Analysis
   *
   * @param string POGID - POGID, eg POG129
   *
   */
  $ta.update = (POGID, report, analysis) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/tumourAnalysis/', analysis).then(
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
  
  return $ta;
  
}]);
