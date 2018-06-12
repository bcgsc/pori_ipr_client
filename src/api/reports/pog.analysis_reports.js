/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pog_analysis_report', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API;

  let $report = {};


  /**
   * Get All Reports
   *
   * Retrieve all report from API that user can access
   *
   * @returns {promise} - Resolves with array of reports
   */
  $report.all = (params={}) => {
    return $q((resolve, reject) => {

      let opts = {
        params: params
      };

      // Retrieve from API
      $http.get(api + '/reports', opts).then(
        (reports) => {
          resolve(reports.data);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        }
      );

    });

  };

  /**
   * Get one Report
   *
   * Retrieve one report from API.
   *
   * @param {string} report - The report ident string (4 chars)
   */
  $report.get = (report) => {

    return $q((resolve, reject) => {

      // Get result from API
      $http.get(api + '/reports/' + report).then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject();
        }
      );
    });
  };

  /**
   * Update a report entry
   *
   * @param {object} report - Report object to be updated
   * @returns {Promise|object}
   */
  $report.update = (report) => {

    return $q((resolve, reject) => {

      $http.put(api + '/reports/' + report.ident, report)
        .then(
          (result) => {
            resolve(result.data);
          },
          (err) => {
            reject(error);
          }
        );

    });

  };

  /**
   * Bind a user to a report
   *
   * @param {string} report - Report Ident
   * @param {string} user - User Ident (or username)
   * @param {string} role - role name
   *
   * @returns {Promise}
   */
  $report.bindUser = (report, user, role) => {
    return $q((resolve, reject) => {

      $http.post(api + '/reports/' + report + '/user', {user: user, role: role})
        .then(
          (result) => {
            resolve(result.data);
          },
          (err) => {
            reject(error);
          }
        );

    });
  };

  /**
   * Unbind a user from a report
   *
   * @param {string} report - Report Ident
   * @param {string} user - User Ident (or username)
   * @param {string} role - role name
   *
   * @returns {Promise}
   */
  $report.unbindUser = (report, user, role) => {
    return $q((resolve, reject) => {

      $http.delete(api + '/reports/' + report + '/user', {
        data: {user: user, role: role},
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        }
      })
        .then(
          (result) => {
            resolve(result.data);
          },
          (err) => {
            reject(err);
          }
        );

    });
  };


  /**
   * POG Nested Reports
   * @param {string} pog - POGID
   */
  $report.pog = (pog) => {
    return {
      /**
       * Get All Reports for this POG
       *
       * Retrieve all report from API that user can access
       *
       * @returns {promise} - Resolves with array of reports
       */
      all: (params={}) => {
        return $q((resolve, reject) => {

          // Retrieve from API
          $http.get(api + '/POG/'+ pog +'/reports', {params: params}).then(
            (reports) => {
              resolve(reports.data);
            },
            (error) => {
              // TODO: Better error handling
              reject(error);
            }
          );

        });

      },

      /**
       * Get one Report
       *
       * Retrieve one report from API.
       *
       * @param {string} report - The report ident string (4 chars)
       */
      get: (report) => {

        return $q((resolve, reject) => {

          // Get result from API
          $http.get(api + '/POG/'+ pog +'/reports/' + report).then(
            (result) => {
              resolve(result.data);
            },
            (error) => {
              // TODO: Better error handling
              reject();
            }
          );
        });
      }

    };
  };

  return $report;

}]);
