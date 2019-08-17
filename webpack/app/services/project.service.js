/**
 * Project service for API calls
 */
class ProjectService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/project`;
  }

  /**
   * Retrieve all projects from API that user can access
   * @param {Object} opts - Options object
   * @return {Promise} Resolves w/ array of projects
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(opts = {}) {
    const { data } = await this.$http.get(this.api, { params: opts });
    return data;
  }

  /**
   * Add a new project entry to API
   * @param {Object} payload - New project object
   * @return {Promise} Add response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async add(payload) {
    const { data } = await this.$http.post(this.api, payload);
    return data;
  }
    
  /**
   * Remove a project
   * @param {Object} project - Project object to delete
   * @return {Promise} Remove response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(project) {
    const { data } = await this.$http.delete(`${this.api}/${project.ident}`);
    return data;
  }

  /**
   * Update a project
   * @param {Object} project - Project object to delete
   * @return {Promise} Update response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(project) {
    const { data } = await this.$http.put(`${this.api}/${project.ident}`, project);
    return data;
  }

  /**
   * Add a user to a project
   * @param {String} project - Project UUID Ident
   * @param {String} user - User UUID ident
   * @return {Promise} Add user response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async addUser(project, user) {
    const { data } = await this.$http.post(`${this.api}/${project}/user`, { user });
    return data;
  }

  /**
   * Remove a user from a project
   * @param {String} project - Project UUID Ident
   * @param {String} user - User UUID ident
   * @return {Promise} Remove user response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async removeUser(project, user) {
    const { data } = await this.$http.delete(`${this.api}/${project}/user`, { data: { user } });
    return data;
  }

  /**
   * Add a pog to a project
   * @param {String} project - Project UUID Ident
   * @param {String} pog - POG UUID ident
   * @return {Promise} Add pog response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async addPog(project, pog) {
    const { data } = await this.$http.post(`${this.api}/${project}/pog`, { pog });
    return data;
  }

  /**
   * Remove a pog from a project
   * @param {String} project - Project UUID Ident
   * @param {String} pog - POG UUID ident
   * @return {Promise} Remove pog response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async removePog(project, pog) {
    const { data } = await this.$http.delete(`${this.api}/${project}/pog`, { data: { pog } });
    return data;
  }
}

export default ProjectService;
