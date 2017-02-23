/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.patientInformation', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://10.9.202.110:8001/api/1.0' + '/POG';
  
  let $pi = {};
  
  
  /*
   * Get Patient Information for POG
   *
   */
  $pi.get = (POGID) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/patientInformation').then(
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
    
  };

  $pi.update = (POGID, pi) => {

    return $q((resolve, reject) => {

      $http.put(api + '/' + POGID + '/summary/patientInformation', pi).then(
        (result) => {
          // All done!
          resolve(result.data);
        },
        (error) => {
          reject(error);
        }
      );

    });

  };
  
  return $pi;
  
}]);
