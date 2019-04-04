/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.microbial', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $microbial = {};


  /**
   * Get Microbial Content
   *
   * @param {string} POGID - PogID of requested resource, eg. POG129
   * @param {string} report - Report ID
   *
   */
  $microbial.get = (POGID, report) => {
    return $q((resolve, reject) => {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/microbial').then(
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

  };

  return $microbial;

}]);
