/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pog', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://localhost:8001/api/1.0' + '/POG';
  let _pogs = [] // Local POGS cache by ident

  
  let $pog = {};
  
  
  /*
   * Get All POGS
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $pog.all = () => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api).then(
        (result) => {
          // Empty Cache
          _pogs = [];

          // Load into cache
          _.forEach(result.data, (val) => {
            _pogs.push(val);
          });
          
          resolve(_pogs);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        }
      );
      
    });
    
  }
  
  /*
   * Get one POG
   *
   * Retrieve one POG from API.
   *
   */
  $pog.id = (POGID) => {
    
    return $q((resolve, reject) => {
      
      // Lookup in cache first
      if(_pogs[POGID] !== undefined) return resolve(_pogs[POGID]);
      
      // Get result from API
      $http.get(api + '/' + POGID).then(
        (result) => {
          _pogs[result.data.POGID] = result.data;
          resolve(_pogs[result.data.POGID]);
        },
        (error) => {
          // TODO: Better error handling
          reject();
        }
      );
    });
  }


  /*
   * Load a new POG
   *
   * Load a new POG into the API from sources
   *
   * @param string POGID
   *
   */
  $pog.load = (POGID) => {

    return $q((resolve, reject) => {

      $http.get(api + '/' + POGID + '/loadPog').then(
        (result) => {
          // Reload All POGS
          $pog.all().then(
            (resp) => {
              resolve();
            },
            (err) => {
              reject('Unable to reload POGS');
            }
          )
        },
        (error) => {
          reject('Unable to load the requested POG');
        }
      )

    });

  }
  
  return $pog;
  
}]);
