/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.therapeuticOptions', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';


  let $therapeutic = {};

  /**
   * Get all POG therapeutic targets
   *
   * @params {string} POGID - PogID to be queried against (eg. POG123)
   */
  $therapeutic.all = (POGID, report) => {
    let deferred = $q.defer();

    $http.get(api + '/' + POGID + '/report/' + report + '/genomic/therapeuticTargets').then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

  /**
   * Create a new Therapeutic Target Entry
   *
   * @param {string} POGID - POGID this entry will be related to
   * @param {object} entry - The therapeutic target entry to be created
   * @returns {Function|promise} - Resolves with the new data entry
   */
  $therapeutic.create = (POGID, report, entry) => {
    let deferred = $q.defer();

    $http.post(api + '/' + POGID + '/report/' + report + '/genomic/therapeuticTargets', entry).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );
    return deferred.promise;
  };

  /**
   * Get all POG therapeutic targets
   *
   * @params {string} POGID - PogID to be queried against (eg. POG123)
   */
  $therapeutic.one = (POGID, report) => {

    let API = api + '/' + POGID + '/report/' + report + '/genomic/therapeuticTargets';

    return {

      /**
       * Retrieve therapeutic target entry
       *
       * @param {string} ident - UUID of entry
       * @returns {Function|promise} - Resolves with object of entry
       */
      retrieve: (ident) => {
        let deferred = $q.defer();

        $http.get(API + '/' + ident ).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (err) => {
            deferred.reject(err);
          }
        );
        return deferred.promise;
      },


      /**
       * Update a single therapeutic target entry
       *
       * @param {string} ident - UUID of entry
       * @param {object} entry - Object of entry to be created
       * @returns {Function|promise} - Resolves with object of entry
       */
      update: (ident, entry) => {
        let deferred = $q.defer();

        $http.put(API + '/' + ident, entry).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (err) => {
            deferred.reject(err);
          }
        );
        return deferred.promise;
      },

      /**
       * Remove therapeutic target entry
       *
       * @param {string} ident - UUID of entry
       * @returns {Function|promise} - Resolves with object of entry
       */
      remove: (ident) => {
        let deferred = $q.defer();
        $http.delete(API + '/' + ident).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (err) => {
            deferred.reject(err);
          }
        );
        return deferred.promise;
      }

    }
  };

  return $therapeutic;

}]);
