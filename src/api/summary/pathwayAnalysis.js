/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.pathwayAnalysis', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $pa = {};


  /*
   * Get Pathway Analysis
   *
   * Retrieve analysis for this POG
   *
   */
  $pa.get = (POGID) => {
    return $q((resolve, reject) => {

      // Retrieve from API
      $http.get(api + '/' + POGID + '/summary/pathwayAnalysis').then(
        (result) => {
          // Return to requestee
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        }
      );

    });

  };


  /*
   * Update Pathway Analysis for this POG
   *
   * @param string POGID - POGID, eg POG129
   * @param string XMLbody - text string of SVG
   *
   */
  $pa.update = (POGID, summary) => {

    return $q((resolve, reject) => {

      // Get result from API
      $http.put(api + '/' + POGID + '/summary/pathwayAnalysis', summary).then(
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

  return $pa;

}]);
