/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/tracking';

  let $tracking = {};

  /**
   * Get all tracking state definitions
   *
   * @param {object} track - POST body to initiate tracking
   *
   * @returns {Promise} - Resolves with object of new tracking data
   */
  $tracking.init = (track) => {
    return $q((resolve, reject) => {

      $http.post(api + '/', track).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

    });
  };
  return $tracking;

}]);
