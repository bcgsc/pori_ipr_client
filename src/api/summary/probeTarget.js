/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.probeTarget', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://localhost:8001/api/1.0' + '/POG';
  
  let $pt = {};
  
  /*
   * Get All Probe Targets
   *
   * Retrieve all Probe Targets for this POG
   *
   * @param string POGID - POGID associated with these resource
   *
   */
  $pt.all = (POGID) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/probeTarget').then(
        (result) => {
        
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
   * Get a Probe Target
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $pt.id = (POGID, ident) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.get(api + '/' + POGID + '/summary/probeTarget/' + ident).then(
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
  
  /*
   * Update a Probe Target
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $pt.update = (POGID, ident, gai) => {
    
    return $q((resolve, reject) => {
      
      // Lookup in cache first
      if(_gai[ident] !== undefined) return resolve(_gai[ident]);
      
      // Get result from API
      $http.put(api + '/' + POGID + '/summary/probeTarget/' + ident, gai).then(
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
  
  /*
   * Remove a Probe Target
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $pt.remove = (POGID, ident) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.delete(api + '/' + POGID + '/summary/probeTarget/' + ident).then(
        (result) => {
          resolve(true);
        },
        (error) => {
          // TODO: Better error handling
          reject();
        }
      );
    });
  }
  
  return $pt;
  
}]);
