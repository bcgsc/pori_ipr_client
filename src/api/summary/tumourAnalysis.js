/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.tumourAnalysis', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://10.9.202.110:8001/api/1.0' + '/POG';
  
  let $ta = {};
  
  
  /*
   * Get Tumour Analysis
   *
   *
   */
  $ta.get = (POGID) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/tumourAnalysis').then(
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
  $ta.update = (POGID, analysis) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.put(api + '/' + POGID + '/summary/tumourAnalysis/', analysis).then(
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
