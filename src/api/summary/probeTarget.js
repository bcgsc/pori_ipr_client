/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.probeTarget', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/POG';
  
  let $pt = {};
  
  /*
   * Get All Probe Targets
   *
   * Retrieve all Probe Targets for this POG
   *
   * @param string POGID - POGID associated with these resource
   *
   */
  $pt.all = (POGID, report) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget').then(
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
  
  /*
   * Get a Probe Target
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $pt.id = (POGID, report, ident) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget/' + ident).then(
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
  $pt.update = (POGID, report, ident, gai) => {
    
    return $q((resolve, reject) => {
      
      // Lookup in cache first
      if(_gai[ident] !== undefined) return resolve(_gai[ident]);
      
      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget/' + ident, gai).then(
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
  $pt.remove = (POGID, report, ident) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.delete(api + '/' + POGID + '/report/' + report + '/genomic/summary/probeTarget/' + ident).then(
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
