class JiraService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = 'https://www.bcgsc.ca/jira/rest/api/2';
    this.apiProxy = `${CONFIG.ENDPOINTS.API}/jira`;
  }

  /**
   * Create a BCGSC JIRA Ticket
   *
   * @param {String} project - project key (DEVSU, TC, UGNE, SVIA, etc.)
   * @param {String} type - Ticket type (Task, Sub-task, Bug, etc.)
   * @param {String} summary - Ticket Title
   * @param {String} description - Body/text of ticket
   * @param {Object} options - Key-value paired hashmap of options: parent, assignee, labels, priority
   *
   * @returns {Promise} - Result of API call
   */
  async createTicket(project, type, summary, description, options = {}) {
    const ticket = {
      fields: {
        project: {
          key: project,
        },
        summary,
        issuetype: {
          name: type,
          subtask: (options.subtask) ? options.subtask : false,
        },
        description,
        priority: {
          name: (options.priority) ? options.priority : 'Medium', // Default priority is medium
        },
      },
    };

    // Are we adding asignee?
    if (options.assignee) {
      ticket.fields.assignee = { key: options.assignee, name: options.assignee };
    }
    if (options.components) ticket.fields.components = options.components;
    if (options.parent) ticket.fields.parent = { key: options.parent };
    if (options.labels) ticket.fields.labels = _.map(options.labels, (l) => { return l.replace(/\s+/g, '-'); });
    if (options.security) ticket.fields.security = { 'name': 'POG Restricted' };

    // Send POST to JIRA
    const resp = await this.$http.post(`${this.api}/issue`, ticket, { headers: { authorization: undefined }, withCredentials: true });
    return resp.data;
  }

  /**
   * Add subtask to existing ticket in JIRA
   *
   * @param {String} ticket - JIRA ticket ID to add subtask to
   * @param {String} title - subtask ticket title
   * @param {String} description - subtask ticket description
   *
   * @returns {Promise} - Result of API call
   */
  async addSubtask(ticket, title, description) {
    // add subtask
    const resp = await this.$http.post(`${this.apiProxy}/subtask`, { title, ticket, description });
    return resp.data;
  }

  /**
   * Get a ticket from JIRA
   *
   * @param {String} ticket - JIRA ticket ID
   *
   * @returns {Promise} - Result of API call
   */
  async getTicket(ticket) {
    const resp = await this.$http.get(`${this.api}/issue/${ticket}`);
    return resp.data;
  }

  /**
   * Create a new JIRA session
   *
   * @param {String} username - JIRA username
   * @param {String} password - JIRA Password
   *
   * @returns {Promise} - result of API call
   */
  async createNewSession(username, password) {
    const resp = await this.$http.post(`${this.api}/session`, { username, password });
    return resp.data;
  }

  /**
   * Get current JIRA session
   *
   * @returns {Promise} - result of API call
   */
  async getCurrentSession() {
    const resp = await this.$http.get('https://www.bcgsc.ca/jira/rest/auth/1/session', { headers: { authorization: undefined }, withCredentials: true });
    return resp;
  }

  /**
   * Get available JIRA ticket priorities
   *
   * @returns {Promise} - array of priorities
   */
  async getPriorities() {
    const resp = await this.$http.get(`${this.api}/priority`, { headers: { authorization: undefined }, withCredentials: true });
    return resp.data;
  }

  /**
   * Get available JIRA projects
   *
   * @returns {Promies} - array of projects
   */
  async getProjects() {
    const resp = await this.$http.get(`${this.api}/project`, { headers: { authorization: undefined }, withCredentials: true });
    return resp.data;
  }

  /**
   * Get details for a specified JIRA project
   *
   * @param {String} project - project key name
   *
   * @returns {Promise} - result of API call
   */
  async getProjectDetails(project) {
    const resp = await this.$http.get(`${this.api}/project/${project}`, { headers: { authorization: undefined }, withCredentials: true });
    return resp.data;
  }

  /**
   * Get available security levels for a specified JIRA project
   *
   * @param {String} project - project key name
   *
   * @returns {Promise} - result of API call
   */
  async getSecurityLevels(project) {
    const resp = await this.$http.get(`${this.api}/project/${project}/securitylevel`, { headers: { authorization: undefined }, withCredentials: true });
    return resp.data;
  }
}
  
export default JiraService;
