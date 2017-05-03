/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.appendices', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $appendices = {};


  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $appendices.tcga = (POGID, report) => {

    return $q((resolve, reject) => {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/appendices/tcga').then(
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
