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
  $report.all = () => {
    return $q((resolve, reject) => {

      // Retrieve from API
      $http.get(api + '/reports').then(
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
      all: () => {
        return $q((resolve, reject) => {

          // Retrieve from API
          $http.get(api + '/POG/'+ pog +'/reports').then(
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
