/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.project', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/project';
  
  
  let $project = {};
  
  
  /**
   * TODO: Deprecate
   * Get All Projects from POG Table
   *
   * Retrieve all projects from API that user can access
   *
   * @returns {promise} - Resolves with array of projects
   */
  $project.all = () => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(CONFIG.ENDPOINTS.API + '/pogProjects').then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        }
      );
      
    });
    
  };

  /**
   * Get All Projects
   *
   * Retrieve all projects from API that user can access
   *
   * @returns {promise} - Resolves w/ array of projects
   */
  $project.getAll = () => {
    return $q((resolve, reject) => {
      $http.get(api).then(
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
   * Add a new project entry to API
   *
   * @param {object} data - New project object
   * @returns {*}
   */
  $project.add = (data) => {
    
    return $q((resolve, reject) => {
      
      $http.post(api, data)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
    
  /**
   * Remove a project
   * @param {object} project - Project object to delete
   * @returns {*}
   */
  $project.remove = (project) => {
    return $q((resolve, reject) => {
      $http.delete(api + '/' + project.ident)
      .then((resp) => {
        resolve(resp.data);
      })
      .catch((err) => {
        reject(err);
      });
    });
  };

  /**
   * Update a project
   * @param {object} project - Project object to delete
   * @returns {*}
   */
  $project.update = (project) => {
    return $q((resolve, reject) => {
      $http.put(api + '/' + project.ident, project)
      .then((resp) => {
        resolve(resp.data);
      })
      .catch((err) => {
        reject(err);
      });
    });
  };

  /**
   * User Binding functions
   * @param {string} project - Project UUID Ident
   * @returns {{add: (function()), remove: (function())}}
   */
  $project.user = (project) => {
    return {

      /**
       * Add a user to a project
       * @param {string} user - User UUID ident
       * @returns {promise}
       */
      add: (user) => {
        let deferred = $q.defer();

        $http.post(api + '/' + project + '/user', {user: user}).then(
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
       * Remove a user from a project
       * @param {string} user - User UUID ident
       * @returns {promise}
       */
      remove: (user) => {
        let deferred = $q.defer();

        $http({
          url: api + '/' + project + '/user',
          method: 'DELETE',
          data: {
            user: user
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(
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
  } // End User Binding functions

  /**
   * POG Binding functions
   * @param {string} project - Project UUID Ident
   * @returns {{add: (function()), remove: (function())}}
   */
  $project.pog = (project) => {
    return {

      /**
       * Add a pog to a project
       * @param {string} user - POG UUID ident
       * @returns {promise}
       */
      add: (pog) => {
        let deferred = $q.defer();

        $http.post(api + '/' + project + '/pog', {pog: pog}).then(
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
       * Remove a pog from a project
       * @param {string} pog - POG UUID ident
       * @returns {promise}
       */
      remove: (pog) => {
        let deferred = $q.defer();

        $http({
          url: api + '/' + project + '/pog',
          method: 'DELETE',
          data: {
            pog: pog
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(
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
  } // End POG Binding functions
  
  return $project;
  
}]);
