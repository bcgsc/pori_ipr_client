/*
 * BCGSC - IPR-Client BCGSC JIRA API
 *
 * This API factory implements the IPR-API. Calls to and from the BCGSC JIRA API are
 * managed through this factory.
 *
 */
app.factory('api.jira', ['_', '$http', '$q', 'api.user', (_, $http, $q, $user) => {

  const api = 'https://www.bcgsc.ca/jira/rest/api/2';
  const apiProxy = CONFIG.ENDPOINTS.API + '/jira';
  let $jira = {};
  let $session = null;

  /**
   * JIRA Ticket Namespace
   *
   */
  $jira.ticket = {

    /**
     * Create a BCGSC JIRA Ticket
     *
     * @param {string} project - project ID integer
     * @param {string} type - Ticket type ID
     * @param {string} summary - Ticket Title
     * @param {string} description - Body/text of ticket
     * @param {object} options - Key-value paired hashmap of other options: parent, assignee, labels, priority
     *
     * @returns promise
     */
    create: (project, type, summary, description, options={}) => {

      let deferred = $q.defer();

      let ticket = {
        fields: {
          project: {
            id: project
          },
          summary: summary,
          issuetype: {
            id: type,
            subtask: (options.subtask) ? options.subtask : false
          },
          description: description,
          priority: {
            id: (options.priority) ? options.priority : 6 // Default priority is medium
          }
        }
      };

      // Are we adding asignee?
      if(options.assignee) ticket.fields.assignee = {key: options.asignee, name: options.asignee};
      if(options.parent) ticket.fields.parent = {key: options.parent};
      if(options.labels) ticket.fields.labels = options.labels; // TODO: Check if array

      // Send POST to JIRA
      $http.post(api + '/issue', ticket).then(
        (response) => {
          // Resolve response
          deferred.resolve(response.data);
        },
        (error) => {
          // Reject
          deferred.reject({status: error.status, body: error.data});
        }
      );

      return deferred.promise;
    },

    /**
     * Add subtask to existing ticket
     *
     *
     * @param {string} ticket
     * @param {string} title
     * @param {string} description
     * @returns {{resolve, reject, promise}|*|Deferred}
     */
    subtask: (ticket, title, description) => {

      let deferred = $q.defer();

      // Try to create ticket
      $http.post(apiProxy + '/subtask', {title: title, ticket: ticket, description: description}).then(
        (resp) => {
          deferred.resolve(resp.data);
        },
        (err) => {
          // After testing, we'll check response header to see if user needs to login to JIRA first.
          console.log('JIRA Sub-task create error', err);
          deferred.reject(err);
        }
      );


      return deferred.promise;
    },

    /**
     * Get a ticket from JIRA
     *
     * @param {string} auth - a Base64 string of username:password
     * @param {string} ticket - JIRA ticket ID
     *
     * @returns promise
     */
    get: (ticket) => {

      let deferred = $q.defer();

      // Send POST to JIRA
      $http.get(api + '/issue/' + ticket).then(
        (response) => {
          // Resolve response
          deferred.resolve(response.data);
        },
        (error) => {
          // Reject
          deferred.reject({status: error.status, body: error.data});
        }
      );

      return deferred.promise;
    }

  };

  /**
   * JIRA Session Management
   *
   */
  $jira.session = {
    /**
     * Attempt a login session on the BCGSC JIRA server
     *
     * @param {string} username - JIRA Username
     * @param {string} password - JIRA Password
     * @returns {*|promise|Promise}
     */
    login: (username, password) => {

      let deferred = $q.defer();

      $http.post(api + '/session', {username: username, password: password}).then(
        (response) => {
          // TODO: Store the cookie on user table
          deferred.resolve(response.data);
        },
        (error) => {
          deferred.reject({status: error.status, body: error.data});
        }
      );

      return deferred.promise;
    }
  };

  /**
   * JIRA Attachments Namespace
   *
   */
  $jira.attachment = {

  };


  return $jira;

}]);
