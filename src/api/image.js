/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.image', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://localhost:8001/api/1.0' + '/POG';
  
  let $image = {};
  
  
  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $image.get = (POGID, key) => {
    
    return $q((resolve, reject) => {
      
      console.log('Stepped into POG api');
      
      // Get result from API
      $http.get(api + '/' + POGID + '/image/' + key).then(
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
  
  return $image;
  
}]);
