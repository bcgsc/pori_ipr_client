/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.user', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/user';
  let _token = null; // User API token
  let _groups = [];

  let $user = {};
  $user._me = null; // Local User Cache

  $user.me = () => {

    return $q((resolve, reject) => {
      if($user._me) return resolve($user._me);
      $http.get(api + '/me').then(
        (self) => {
          _groups = self.data.groups;
          $user._me = self.data;
          resolve($user._me);
        },
        (error) => {
          reject(error);
        }
      );

    });

  };

  $user.isAdmin =() => {
    let aGroups = _.filter(_groups, (g) => {
      if(g.name == 'superUser' || g.name == 'admin') return g;
    });

    return (aGroups.length > 0)
  };

  /**
   * Get all users (admin)
   *
   * @returns {promise}
   */
  $user.all = () => {

    let deferred = $q.defer();

    $http.get(api).then(
      (result) => {
        deferred.resolve(result.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;

  };

  /**
   * Update a user entry
   *
   * @param user
   * @returns {Function}
   */
  $user.update = (user) => {
    let deferred = $q.defer();

    $http.put(api + '/' + user.ident,user).then(
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
   * Create a new user account
   *
   * @param user
   * @returns {promise}
   */
  $user.create = (user) => {
    let deferred = $q.defer();

    $http.post(api + '/', user).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

  $user.search = (query) => {
    let deferred = $q.defer();

    $http.get(api + '/search?query='+query).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

  $user.delete = (user) => {

    let deferred = $q.defer();

    // Remove User
    $http.delete(api + '/' + user.ident).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

  /* Group Functions */
  $user.group = {

    /**
     * Get all groups
     * @returns {promise}
     */
    all: () => {
      let deferred = $q.defer();

      $http.get(api + '/group').then(
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
     * Retrieve group
     *
     * @param {string} ident - Group Ident to be looked up
     */
    retrieve: (ident) => {
      return $q((resolve, reject) => {
        $http.get(api + '/group/' + ident).then(
          (resp) => {
            resolve(resp.data);
          },
          (err) => {
            reject(err);
          }
        );
      });
    },

    /**
     * Create new Group
     * @param name
     * @returns {promise}
     */
    create: (group) => {
      let deferred = $q.defer();

      $http.post(api + '/group', group).then(
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
     * Remove a group
     * @param {string} ident - Group UUID Ident
     * @returns {promise}
     */
    remove: (group) => {
      let deferred = $q.defer();

      $http.delete(api + '/group/' + group.ident).then(
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
     * Update a group
     * @param {string} ident - Group UUID Ident
     * @param {object} group - Group object to be updated
     * @returns {promise}
     */
    update: (ident, group) => {
      let deferred = $q.defer();

      $http.put(api + '/group/'+ident, group).then(
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
     * Group membership functions
     * @param {string} group - Group UUID Ident
     * @returns {{add: (function()), remove: (function())}}
     */
    member: (group) => {
      return {

        /**
         * Add a user to a group
         * @param {string} user - User UUID ident
         * @returns {promise}
         */
        add: (user) => {
          let deferred = $q.defer();

          $http.post(api + '/group/'+group+'/member', {user: user}).then(
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
         * Remove a user from a group
         * @param {string} user - User UUID ident
         * @returns {promise}
         */
        remove: (user) => {
          let deferred = $q.defer();

          $http({
            url: api + '/group/' + group + '/member',
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
    } // End Member functions

  };


  return $user;

}]);
