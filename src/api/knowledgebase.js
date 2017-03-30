"use strict";

app.factory('api.knowledgebase', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/knowledgebase';

  let $kb = {};

  $kb.validate = {

    /**
     * Validate provided KB Events string
     *
     * @param {string} input - Input string to be validated against KB Regex
     * @returns {promise|object} - Resolves with {valid: {input}}
     */
    events: (input) => {
      let deferred = $q.defer();

      $http.post(api + '/validate/events', {events_expression: input}).then(
        (result) => {
          deferred.resolve(result.data);
        },
        (err) => {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    }

  };

  /**
   * Check for a gene or variant in KB & HUGO
   *
   * @param {string} query - Input string to search DB against
   * @returns {Promise|array} - Resolves an array of text values
   */
  $kb.genevar = (query) => {
    let deferred = $q.defer();

    $http.get(api + '/genevar?query=' + query).then(
      (result) =>{
        deferred.resolve(result.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

  return $kb;
}]);