/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.probe.signature', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $signature = {};


  /**
   * Get Probe Signature Details
   *
   * Retrieve probe sign-off details
   *
   */
  $signature.get = (POGID, report) => {

    return $q((resolve, reject) => {

      // Get result from API
      $http.get(api + '/' + POGID + '/report/' + report + '/probe/signature').then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  /**
   * Sign the probe report
   *
   * @param {string} POGID - POGID
   * @param {string} report - Report Ident string
   * @param {string} role - Report signing role
   * @returns {Promise|object}
   */
  $signature.sign = (POGID, report, role) => {
    return $q((resolve, reject) => {

      $http.put(api + '/' + POGID + '/report/' + report + '/probe/signature/' + role, {}).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

    });
  };

  /**
   * Revoke a probe report signature
   *
   * @param {string} POGID - POGID
   * @param {string} report - Report Ident string
   * @param {string} role - Report signing role
   * @returns {Promise|object}
   */
  $signature.revoke = (POGID, report, role) => {
    return $q((resolve, reject) => {

      $http.put(api + '/' + POGID + '/report/' + report + '/probe/signature/revoke/' + role, {}).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

    });
  };

  return $signature;

}]);
