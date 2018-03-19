/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */
app.factory('api.recentReports', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/analysis_reports/recent';
  
  let $recent = {};
  
  /**
   * Get all recent reports
   *
   * @returns {Promise} - Resolves with array of recent report entries
   */
  $recent.all = () => {
    return $q((resolve, reject) => {
      
      $http.get(api + '/')
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  
  /**
   * Add new entry
   *
   * @param {string} report - Ident string of analysis report
   * @param {string} state - The state string to be stored (current page)
   *
   * @returns {Promise} - Resolves with recent report entry
   */
  $recent.addOrUpdate = (report, state) => {
    return $q((resolve, reject) => {
      
      $http.put(api + '/report/' + report, {state: state})
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };

    /**
   * Remove Recent Report entry (based on recent report ident)
   *
   * @param {string} report - Ident string of analysis report
   *
   * @returns {Promise} - Resolves with nothing
   */
  $recent.remove = (recentReport) => {
    return $q((resolve, reject) => {
      
      $http.delete(api + '/' + recentReport)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
      
    });
  };
  
  return $recent;
  
}]);
