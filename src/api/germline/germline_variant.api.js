/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */

app.factory('api.germline.variant', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/germline_small_mutation';
  
  let $variant = {};
  
  /**
   * Get a variant
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {string} variant - Variant UUID
   *
   * @returns {Promise/object} - Resolves with variant object
   */
  $variant.one = (patient, biopsy, report, variant) => {
    return $q((resolve, reject) => {

      $http.get(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}/report/${report}/variant/${variant}`)
        .then((variant) => {
          resolve(variant);
        })
        .catch((e) => {
          reject(e);
        });
      
    });
  };
  
  /**
   * Update a variant
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report object UUID
   * @param {string} variant - Variant object UUID
   * @param {object} data - Review body payload
   *
   * @returns {Promise/object} - Resolves with created review object
   */
  $variant.update = (patient, biopsy, report, variant, data) => {
    return $q((resolve, reject) => {

      $http.put(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}/report/${report}/variant/${variant}`, data)
        .then((response) => {
          resolve(response.data);
        })
        .catch((e) => {
          reject(e);
        });
      
    });
  };
  
  return $variant;
  
}]);
