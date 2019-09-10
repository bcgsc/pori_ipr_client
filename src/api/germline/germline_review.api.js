/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */

app.factory('api.germline.review', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/germline_small_mutation';
  
  let $review = {};
  
  /**
   * Add a new review
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report UUID
   * @param {object} data - Review body payload
   *
   * @returns {Promise/object} - Resolves with created review object
   */
  $review.add = (patient, biopsy, report, data) => {
    return $q((resolve, reject) => {

      $http.put(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}/report/${report}/review`, data)
        .then((review) => {
          resolve(review.data);
        })
        .catch((e) => {
          reject(e);
        });
      
    });
  };
  
  /**
   * Remove a review
   *
   * @param {string} patient - Patient ID (POG1234)
   * @param {string} biopsy - Biopsy name (biop1)
   * @param {string} report - Report object UUID
   * @param {string} review - Review object UUID
   * @param {object} data - Review body payload
   *
   * @returns {Promise/object} - Resolves with created review object
   */
  $review.remove = (patient, biopsy, report, review, data) => {
    return $q((resolve, reject) => {

      $http.delete(`${api}/patient/${patient}/biopsy/${biopsy || 'biop1'}/report/${report}/review/${review}`, data)
        .then(() => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
      
    });
  };
  
  return $review;
  
}]);
