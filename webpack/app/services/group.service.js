class GroupService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = CONFIG.ENDPOINTS.API;
  }
  
  /**
   * Retrieve all groups
   * @return {Promise} All response
   * @throws {ErrorType} Thrown when API call fails
   */
  async all() {
    const resp = await this.$http.get(`${this.api}/group`);
    return resp.data;
  }

  /**
   * Retrieve group
   * @param {String} ident - Group UUID ident
   * @return {Promise} Retrieve response
   * @throws {ErrorType} Thrown when API call fails
   */
  async retrieve(ident) {
    const resp = await this.$http.get(`${this.api}/group/${ident}`);
    return resp.data;
  }

  /**
   * Create new group
   * @param {String} group - Group UUID ident
   * @return {Promise} Group response
   * @throws {ErrorType} Thrown when API call fails
   */
  async create(group) {
    const resp = await this.$http.post(`${this.api}/group`, group);
    return resp.data;
  }

  /**
   * Remove a group
   * @param {String} group - Group UUID ident
   * @return {Promise} Remove response
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(group) {
    const resp = await this.$http.delete(`${this.api}/group/${group.ident}`);
    return resp.data;
  }

  /**
   * Update a group
   * @param {String} ident - Group UUID ident
   * @param {Object} group - Group object to be updated
   * @return {Promise} Update response
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(ident, group) {
    const resp = await this.$http.put(`${this.api}/group/${ident}`, group);
    return resp.data;
  }

  /**
   * Add a user to a group
   * @param {String} group - Group UUID ident
   * @param {String} user - User UUID ident
   * @return {Promise} Add user response
   * @throws {ErrorType} Thrown when API call fails
   */
  async addUser(group, user) {
    const resp = await this.$http.post(`${this.api}/group/${group}/member`, { user });
    return resp.data;
  }

  /**
   * Remove a user from a group
   * @param {String} group - Group UUID ident
   * @param {String} user - User UUID ident
   * @return {Promise} Remove user response
   * @throws {ErrorType} Thrown when API call fails
   */
  async removeUser(group, user) {
    const resp = await this.$http.delete(`${this.api}/group/${group}/member`, {
      data: { user },
      headers: { 'Content-Type': 'application/json' },
    });
    return resp.data;
  }
}
    
export default GroupService;
