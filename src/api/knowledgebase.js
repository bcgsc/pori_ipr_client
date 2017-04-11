"use strict";

app.factory('api.knowledgebase', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/knowledgebase';

  let $kb = {};

  /**
   * Get controlled vocabulary JSON arrays
   *
   * @returns {Promise}
   */
  $kb.vocabulary = () => {
    let deferred = $q.defer();

    $http.get(api + '/controlled-vocabulary').then(
      (result) => {
        deferred.resolve(result.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

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

  /**
   * Search the disease ontology list
   *
   * @param {string} query - Input string to search DB against
   * @returns {Promise|array} - Resolves an array of text values
   */
  $kb.diseaseOntology = (query) => {
    let deferred = $q.defer();

    $http.get(api + '/disease-ontology?query=' + query).then(
      (result) =>{
        deferred.resolve(result.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

  $kb.references = {

    /**
     * Get KB References
     *
     * Paginated interface
     *
     * @param {int} limit - Pagination records requested
     * @param {int} offset - Pagination start point
     * @param {object} filters - Query string filter arguments
     * @returns {promise|collection} - Resolves with a collection
     */
    all: (limit=100, offset=0, filters={}) => {
      let deferred = $q.defer();
      let processFilters = {};

      // Process Filters
      _.forEach(filters, (value, filter) => {
        processFilters[filter] = _.join(value,',');
      });


      let opts = {params: processFilters};
      opts.params.limit = limit;
      opts.params.offset = offset;

      $http.get(api + '/references', opts).then(
        (result) => {
          deferred.resolve(result.data);
        },
        (err) => {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    },

    /**
     * Get the count of references
     *
     * Informs pagination
     *
     * @returns {promise} - Resolves a key-value pair object with the amount of references
     */
    count: (filters={}) => {
      let deferred = $q.defer();
      let processFilters = {};

      // Process Filters
      _.forEach(filters, (value, filter) => {
        processFilters[filter] = _.join(value,',');
      });


      let params = {params: processFilters};

      $http.get(api + '/references/count', params).then(
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

  $kb.events = {

    /**
     * Get KB Events
     *
     * Paginated interface
     *
     * @param {int} limit - Pagination records requested
     * @param {int} offset - Pagination start point
     * @returns {promise|collection} - Resolves with a collection
     */
    all: (limit, offset) => {
      let deferred = $q.defer();

      $http.get(api + '/events', {params: {limit: limit, offset: offset}}).then(
        (result) => {
          deferred.resolve(result.data);
        },
        (err) => {
          deferred.reject(err);
        }
      );

      return deferred;
    }
  };

  return $kb;
}]);