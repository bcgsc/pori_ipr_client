/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pogDataHistory', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';


  let $history = {};

  /**
   * Setup History Object for Querying
   *
   * @params {string} POGID - PogID to be queried against (eg. POG123)
   */
  $history = (POGID) => {
    const API = api + '/' + POGID;

    return {

      /**
       * Get list of all history events for a POG
       *
       * @returns {promise|array} - Returns a list of all history events for a POG
       */
      all: () => {
        let deferred = $q.defer();

        $http.get(API + '/history').then(
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
       * Get a detailed entry of a history event
       *
       * @param {string} ident - UUID of history event
       * @returns {promise|object} - Resolves with hashmap of detailed version data. Rejects with $http error response
       */
      detail: (ident) => {
        let deferred = $q.defer();

        $http.get(API + '/history/detail/' +ident).then(
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
       * Reverts a change history event from new to previous
       *
       * @param {string} ident - UUID of history event
       * @returns {promise|object} - Returns new history object that defines the change
       */
      revert: (ident) => {
        let deferred = $q.defer();

        $http.get(API + '/history/revert/' +ident).then(
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
       * Restores a remove history event
       *
       * @param {string} ident - UUID of history event
       * @returns {promise|boolean} - Returns boolean
       */
      restore: (ident) => {
        let deferred = $q.defer();

        $http.get(API + '/history/revert/' +ident).then(
          (resp) => {
            deferred.resolve(true);
          },
          (err) => {
            deferred.reject(err);
          }
        );

        return deferred.promise;
      },


      tag: {

        /**
         * Get all history tags
         *
         * @returns {promise|array} - Resolves with an array of tags associated to any history objects in the POG
         */
        all: () => {
          let deferred = $q.defer();

          $http.get(API + '/history/tag').then(
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
         * Create a new tag
         *
         * If no history ident string is provided, the API will make one on the HEAD of the history log
         *
         * @param {object} tag - Text/name of the tag
         * @param {string} ident? - Optional history UUID ident string
         * @returns {promise|object} - Resolves with new tag object
         */
        create: (tag, ident="") => {
          let deferred = $q.defer();

          $http.post(tag, API + '/history/tag/' +ident).then(
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
         * Remove a tag
         *
         * If no history ident string is provided, the API will make one on the HEAD of the history log
         *
         * @param {string} ident - Tg UUID ident string
         * @returns {promise|boolean} - Returns boolean
         */
        remove: (ident) => {
          let deferred = $q.defer();

          $http.delete(tag, API + '/history/tag/' +ident).then(
            (resp) => {
              deferred.resolve(true);
            },
            (err) => {
              deferred.reject(err);
            }
          );
          return deferred.promise;
        }
      }
    }
  };

  return $history;

}]);
