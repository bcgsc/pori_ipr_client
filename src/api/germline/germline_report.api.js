/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */

app.factory('api.germline.report', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/germline_small_mutation';
  
  let $report = {};
  
  /**
   * Get all small mutation reports
   *
   * @returns {Promise} - Resolves with object of {total: int, reports: [{collection},{},...]}
   */
  $report.all = (params={}) => {
    return $q((resolve, reject) => {
      
      $http.get(`${api}`, {params: params})
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  /**
   * Get all reports for a biopsy
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {object} params - Parameters to pass
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.biopsy = (patient, biopsy, params={}) => {
    return $q((resolve, reject) => {

      $http.get(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}`, {params: params})
        .then((reports) => {
          resolve(reports);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  
  /**
   * Get a single report
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {object} params - Parameters to pass
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.one = (patient, biopsy, report, params={}) => {
    return $q((resolve, reject) => {
      $http.get(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}/report/${report}`, {params: params})
        .then((report) => {
          resolve(report.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  
  
  /**
   * Update a single report
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {object} data - Updated report data payload
   * @param {object} params - Parameters to pass
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.update = (patient, biopsy, report, data, params={}) => {
    return $q((resolve, reject) => {
      $http.put(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}/report/${report}`, data, {params: params})
        .then((report) => {
          resolve(report.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  
  
  /**
   * Delete a report
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   *
   * @returns {Promise/array} - Resolves with array of reports
   */
  $report.delete = (patient, biopsy, report) => {
    return $q((resolve, reject) => {
      $http.delete(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}/report/${report}`)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  
  /**
   * Retrieve a flash token to download a report
   *
   * @returns {Promise/object} - Resolves with token object
   */
  $report.flash_token = () => {
    return $q((resolve, reject) => {
      
      $http.get(`${api}/export/batch/token`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  
  return $report;
  
}]);
