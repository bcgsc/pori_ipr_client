/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.summary.analystComments', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/POG';
  
  let $ac = {};
  
  
  /*
   * Get Analyst comments
   *
   * Retrieve anaylist comments for this POG
   *
   */
  $ac.get = (POGID, report) => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments').then(
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
   * Update an Analyst comment
   *
   * @param string POGID - POGID, eg POG129
   * @param string summary - Text body of summary
   *
   */
  $ac.update = (POGID, report, summary) => {
    
    return $q((resolve, reject) => {
      
      // Get result from API
      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments', summary).then(
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
   * Sign Analyst Comments
   *
   * @param {string} POGID
   * @param {string} report - Report unique identifier
   * @param {string} role - The role to sign for
   *
   */
  $ac.sign = (POGID, report, role) => {

    return $q((resolve, reject) => {

      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments/sign/' + role, {}).then(
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
   * Revoke Analyst Comments Signature
   *
   * @param {string} POGID
   * @param {string} report - Report unique identifier
   * @param {string} role - The role to sign for
   *
   */
  $ac.revokeSign = (POGID, report, role) => {

    return $q((resolve, reject) => {

      $http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/analystComments/sign/revoke/' + role, {}).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      );
    });
  };

  return $ac;
  
}]);
