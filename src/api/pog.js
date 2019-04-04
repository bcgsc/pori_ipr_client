/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pog', ['_', '$http', '$q', (_, $http, $q) => {
  const api = `${CONFIG.ENDPOINTS.API}/POG`;
  let _pogs = []; // Local POGS cache by ident

  
  const $pog = {};
  
  
  /**
   * Get All POGs
   *
   * Retrieve all POGs from API that user can access
   *
   * @param {object} opts - Options block
   * @returns {promise} - Resolves with array of POGs
   */
  $pog.all = (opts = {}) => {
    return $q((resolve, reject) => {
      const url = api;

      // Retrieve from API
      $http.get(url, { params: opts }).then(
        (result) => {
          // Empty Cache
          _pogs = [];

          // Load into cache
          _.forEach(result.data, (val) => {
            _pogs.push(val);
          });
          
          resolve(_pogs);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        },
      );
    });
  };
  
  /*
   * Get one POG
   *
   * Retrieve one POG from API.
   *
   */
  $pog.id = (POGID) => {
    return $q((resolve, reject) => {
      // Lookup in cache first
      if (_pogs[POGID] !== undefined) return resolve(_pogs[POGID]);
      
      // Get result from API
      $http.get(`${api}/${POGID}`).then(
        (result) => {
          _pogs[result.data.POGID] = result.data;
          resolve(_pogs[result.data.POGID]);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        },
      );
    });
  };

  /*
   * Update POG
   *
   */
  $pog.update = (pog) => {
    return $q((resolve, reject) => {
      // Call API to update
      $http.put(`${api}/${pog.POGID}`, pog).then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        },
      );
    });
  };

  // Empty out cache
  $pog.destroy = () => {
    _pogs = {};
  };

  $pog.user = (POGID) => {
    return {
      bind: (ident, role) => {
        const deferred = $q.defer();

        $http.post(`${api}/${POGID}/user`, { user: ident, role: role }).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (err) => {
            deferred.reject(err);
          },
        );

        return deferred.promise;
      },

      unbind: (ident, role) => {
        const deferred = $q.defer();

        $http({
          url: `${api}/${POGID}/user`,
          method: 'DELETE',
          data: {
            user: ident,
            role: role,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (err) => {
            deferred.reject(err);
          },
        );

        return deferred.promise;
      },
    };
  };

  $pog.export = (POGID) => {
    return {

      /**
       * Run export
       * @returns {promise} - Resolves the export return
       */
      csv: () => {
        const deferred = $q.defer();

        // Send request
        $http.get(`${api}/${POGID}/export/csv`).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (err) => {
            deferred.reject(err);
          },
        );

        return deferred.promise;
      },

      /**
       * Get all pog export entries
       *
       * @returns {promise} - Resolves with array of pog export events
       */
      all: () => {
        const deferred = $q.defer();

        // Send request
        $http.get(`${api}/${POGID}/export/all`).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (err) => {
            deferred.reject(err);
          },
        );

        return deferred.promise;
      },
    };
  };

  return $pog;
}]);
