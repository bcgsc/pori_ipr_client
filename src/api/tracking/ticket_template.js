/**
 * BCGSC - IPR-Client Tracking State Definition API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 * Author: Brandon Pierce <bpierce@bcgsc.ca>
 */


app.factory('api.tracking.ticket_template', ['_', '$http', '$q', (_, $http, $q) => {
  const api = CONFIG.ENDPOINTS.API + '/tracking/ticket/template';
  
  let $template = {};
  
  /**
   * Get all definition ticket templates
   *
   * @param {string} definition - Definition ident string
   *
   * @returns {Promise} - Resolves with array of templates
   */
  $template.getDefTasks = (definition) => {
    return $q((resolve, reject) => {
      
      $http.get(api + '/definition/' + definition).then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )
      
    });
  };
  
  /**
   * Create new ticket template for a definition
   *
   * @param {string} definition - Definition ident string
   * @param {string} template - Ticket template to pass to API
   *
   * @returns {Promise/object} - Resolves with new definition object
   */
  $template.create = (definition, template) => {
    return $q((resolve, reject) => {
      
      $http.post(api + '/definition/' + definition, template)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to create new ticket template', err);
          reject(err);
        });
      
    });
  };
  
  /**
   * Update the ticket template
   *
   * @param {string} definition - The definition ident string
   * @param {string} template - The Ticket Template object
   *
   * @returns {Promise/object} - Resolves with updated object from API
   */
  $template.update = (definition, template) => {
    return $q((resolve, reject) => {
      
      $http.put(api + '/definition/' + definition + '/template/' + template.ident, template)
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to update ticket template', err);
          reject(err);
        });
      
    });
  };
  
  /**
   * Remove a ticket template entry
   *
   * @param {string} definition - The definition ident string
   * @param {string} template - The template ident stirng
   *
   * @returns {Promise/boolean}
   */
  $template.remove = (definition, template) => {
    return $q((resolve, reject) => {
      
      $http.delete(api + '/definition/' + definition + '/template/' + template)
        .then((result) => {
          resolve(true)
        })
        .catch((err) => {
          console.log('Failed to remove the ticket template', err);
          reject(err);
        });
      
    });
  };
  
  return $template;
  
}]);
