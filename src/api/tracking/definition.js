/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.tracking.definition', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/tracking';

  let $definition = {};


  /**
   * Get all tracking state definitions
   *
   * @returns {Promise} - Resolves with array of definitions
   */
  $definition.all = (options={params: null}) => {
    return $q((resolve, reject) => {

      if(!options.params) options.params = null;

      $http.get(api + '/definition', options).then(
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
   * Create new definition
   *
   * @param {object} definition - The definition to be created
   * @returns {Promise} - Resolves with created object
   */
  $definition.create = (definition) => {
    return $q((resolve, reject) => {

      $http.post(api + '/definition', definition).then(
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
   * Retrieve a single definition
   *
   * @param {string} ident - single UUID
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $definition.retrieve = (ident) => {
    return $q((resolve, reject) => {

      $http.get(api + '/definition/' + ident).then(
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
   * Update an existing definition
   *
   * @param {string} ident - single UUID
   * @param {object} definition - the updated definition entry
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $definition.update = (ident, definition) => {
    return $q((resolve, reject) => {

      $http.put(api + '/definition/' + ident, definition).then(
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
   * Remove a definition
   *
   * @param {string} ident - UUID of definition to be removed
   *
   * @returns {Promise} - Resolves with updated entry
   */
  $definition.remove = (ident) => {
    return $q((resolve, reject) => {

      $http.delete(api + '/definition/' + ident).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )
    });
  }

  return $definition;

}]);
