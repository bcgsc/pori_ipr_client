/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.genomicEventsTherapeutic', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://10.9.202.110:8001/api/1.0' + '/POG';
  
  let $get = {};
  
  
  /*
   * Get Genomic Events with Therapeutic Association
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $get.all = (POGID) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/genomicEventsTherapeutic').then(
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
   * Get an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $get.id = (POGID, ident) => {
    
    return $q((resolve, reject) => {
            
      // Get result from API
      $http.get(api + '/' + POGID + '/summary/genomicEventsTherapeutic/' + ident).then(
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
   * Update an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $get.update = (POGID, ident, get) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.put(api + '/' + POGID + '/summary/genomicEventsTherapeutic/' + ident, get).then(
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
   * Remove an Genomic Event with Therapeutic Association
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  $get.remove = (POGID, ident) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.delete(api + '/' + POGID + '/summary/genomicEventsTherapeutic/' + ident).then(
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
  
  return $get;
  
}]);
