/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.image', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/POG';
  
  let $image = {};
  
  
  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $image.get = (POGID, report, key) => {
    
    return $q((resolve, reject) => {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/image/retrieve/' + key).then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject();
        }
      );
    });
  };

  /*
   * Get Density Graphs
   *
   *
   */
  $image.expDensityGraphs = (POGID, report) => {

    return $q((resolve, reject) => {

      // Get Graphs
      $http.get(api + '/' + POGID + '/report/' + report + '/image/expressionDensityGraphs').then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          reject(error.status);
        }
      )

    });

  };

  return $image;
  
}]);
