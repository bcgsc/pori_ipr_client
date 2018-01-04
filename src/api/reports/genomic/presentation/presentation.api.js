/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.presentation', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/POG';
  
  let $presentation = {};
  
  
  // Discussion Endpoints
  $presentation.discussion = {
  
    /**
     * Get All Discussion notes
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     *
     * @returns {Promise} - Resolves with all entries
     */
    all: (patient, report) => {
      return $q((resolve, reject) => {
        $http.get(`${api}/${patient}/report/${report}/genomic/presentation/discussion`)
          .then((result) => {
            resolve(result.data);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
  
    /**
     * Create new discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {object} data - New entry data object
     *
     * @returns {Promise} - Resolves with new entry
     */
    create: (patient, report, data) => {
      return $q((resolve, reject) => {
        
        $http.post(`${api}/${patient}/report/${report}/genomic/presentation/discussion`, data)
          .then((result) => {
            resolve(result.data);
          })
          .catch((e) => {
            reject(e);
          });
        
      });
    },
  
    /**
     * Get a discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Report ident string
     *
     * @returns {Promise} - Resolves with updated entry
     */
    get: (patient, report, ident) => {
      return $q((resolve, reject) => {
        
        $http.get(`${api}/${patient}/report/${report}/genomic/presentation/discussion/${ident}`)
          .then((result) => {
            resolve(result.data);
          })
          .catch((e) => {
            reject(e);
          });
        
      });
    },
  
    /**
     * Update an existing discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Report ident string
     * @param {object} data - data object of entry
     *
     * @returns {Promise} - Resolves with updated entry
     */
    update: (patient, report, ident, data) => {
      return $q((resolve, reject) => {
        
        $http.put(`${api}/${patient}/report/${report}/genomic/presentation/discussion/${ident}`, data)
          .then((result) => {
            resolve(result.data);
          })
          .catch((e) => {
            reject(e);
          });
        
      });
    },
  
    /**
     * Remove an existing discussion entry
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Report ident string
     *
     * @returns {Promise} - Resolves with updated entry
     */
    remove: (patient, report, ident) => {
      return $q((resolve, reject) => {
        
        $http.delete(`${api}/${patient}/report/${report}/genomic/presentation/discussion/${ident}`)
          .then((result) => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
        
      });
    }
    
  };
  
  // Slides endpoints
  $presentation.slide = {
  
    /**
     * Get all presentation slides for this report
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     *
     * @returns {Promise} - resolves with all slides
     */
    all: (patient, report) => {
      return $q((resolve, reject) => {
        $http.get(`${api}/${patient}/report/${report}/genomic/presentation/slide`)
          .then((result) => {
            resolve(reuslt.data);
          })
          .catch((e) => {
            reject(e);
          });
  
      });
    },
    
    /**
     * Get a presentation slide
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Slide ident string
     *
     * @returns {Promise} - resolves with all slides
     */
    get: (patient, report, ident) => {
      return $q((resolve, reject) => {
        $http.get(`${api}/${patient}/report/${report}/genomic/presentation/slide`)
          .then((result) => {
            resolve(reuslt.data);
          })
          .catch((e) => {
            reject(e);
          });
  
      });
    },
    
    /**
     * Remove presentation slide
     *
     * @param {string} patient - Patient ID
     * @param {string} report - Report Ident
     * @param {string} ident - Slide ident string
     *
     * @returns {Promise} - resolves with all slides
     */
    remove: (patient, report, ident) => {
      return $q((resolve, reject) => {
        $http.delete(`${api}/${patient}/report/${report}/genomic/presentation/slide/${ident}`)
          .then((result) => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
  
      });
    },
  
  };
  
  
  
  return $presentation;
  
}]);
