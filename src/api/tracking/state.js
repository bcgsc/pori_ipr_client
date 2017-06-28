/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.state', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/tracking';

  let $state = {};

  /**
   * Get all tracking state definitions
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $state.all = () => {
    return $q((resolve, reject) => {

      $http.get(api + '/').then(
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
   * Get get single state
   *
   * @params {object} ident - Options for querying states
   *
   * @returns {Promise} - Resolves with collection of states
   */
  $state.getState = (ident) => {

    return $q((resolve, reject) => {
      $http.get(api + '/state/' + ident).then(
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
   * Update a state's details
   *
   * @param ident
   * @param state
   *
   * @returns {Promise} - Resolves with updated state
   */
  $state.update = (ident, state) => {

    return $q((resolve, reject) => {

      $http.put(api + '/state/' + ident, state).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )
    });
  };

  return $state;

}]);
