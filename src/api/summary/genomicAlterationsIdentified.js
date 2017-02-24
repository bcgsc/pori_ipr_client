/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.genomicAterationsIdentified', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://10.9.202.110:8001/api/1.0' + '/POG';
  
  let $gai = {};
  
  /*
   * Get All POGS
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $gai.all = (POGID) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/genomicAlterationsIdentified').then(
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
   * Get an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $gai.id = (POGID, ident) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.get(api + '/' + POGID + '/summary/genomicAlterationsIdentified/' + ident).then(
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
   * Update an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $gai.update = (POGID, ident, gai) => {
    
    return $q((resolve, reject) => {
      
      // Lookup in cache first
      if(_gai[ident] !== undefined) return resolve(_gai[ident]);
      
      // Get result from API
      $http.put(api + '/' + POGID + '/summary/genomicAlterationsIdentified/' + ident, gai).then(
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
   * Remove an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $gai.remove = (POGID, ident, cascade=false) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.delete(api + '/' + POGID + '/summary/genomicAlterationsIdentified/' + ident + ((cascade) ? '?cascade=true' : '')).then(
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
  
  return $gai;
  
}]);
