/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.mutationSummary', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://localhost:8001/api/1.0' + '/POG';
  
  let $ms = {};
  
  
  /*
   * Get Genomic Events with Therapeutic Association
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $ms.get = (POGID) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/mutationSummary').then(
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
   * Update an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $ms.update = (POGID, summary) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.put(api + '/' + POGID + '/summary/mutationSummary/', summary).then(
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
  
  return $ms;
  
}]);
