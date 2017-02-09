/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.appendices', ['_', '$http', '$q', (_, $http, $q) => {

  const api = 'http://10.9.202.110:8001/api/1.0' + '/POG';

  let $appendices = {};


  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $appendices.tcga = (POGID) => {

    return $q((resolve, reject) => {

      // Get result from API
      $http.get(api + '/' + POGID + '/genomic/appendices/tcga').then(
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

  return $appendices;

}]);
