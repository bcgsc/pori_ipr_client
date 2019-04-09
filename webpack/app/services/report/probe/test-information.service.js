/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.probe.testInformation', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $testInformation = {};


  /*
   * Get one Image
   *
   * Retrieve one image from API.
   *
   */
  $testInformation.get = (POGID, report) => {

    return $q((resolve, reject) => {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/probe/testInformation').then(
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

  return $testInformation;

}]);
