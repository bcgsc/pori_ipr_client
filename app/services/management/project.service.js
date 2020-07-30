import { $http } from 'ngimport';

class ProjectService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/project`;
  }

  /**
   * Retrieve all projects from API that user can access
   * @param {Object} opts - Options object
   * @return {Promise} Resolves w/ array of projects
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(opts = {}) {
    const { data } = await $http.get(this.api, { params: opts });
    return data;
  }

  /**
   * Add a new project entry to API
   * @param {Object} payload - New project object
   * @return {Promise} Add response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async add(payload) {
    const { data } = await $http.post(this.api, payload);
    return data;
  }

  /**
   * Remove a project
   * @param {Object} project - Project object to delete
   * @return {Promise} Remove response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(project) {
    const { data } = await $http.delete(`${this.api}/${project.ident}`);
    return data;
  }

  /**
   * Update a project
   * @param {Object} project - Project object to delete
   * @return {Promise} Update response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(project) {
    const { data } = await $http.put(`${this.api}/${project.ident}`, project);
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
    const { data } = await $http.post(`${this.api}/${project}/user`, { user });
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
    const { data } = await $http.delete(`${this.api}/${project}/user`, { data: { user } });
    return data;
  }

  /**
   * Add a report to a project
   * @param {String} project - Project UUID Ident
   * @param {String} report - report ident
   * @return {Promise} Add report response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async addReport(project, report) {
    const { data } = await $http.post(`${this.api}/${project}/reports`, { report });
    return data;
  }

  /**
   * Remove a report from a project
   * @param {String} project - Project UUID Ident
   * @param {String} report - report ident
   * @return {Promise} Remove report response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async removeReport(project, report) {
    const { data } = await $http.delete(`${this.api}/${project}/reports`, { data: { report } });
    return data;
  }
}

export default new ProjectService();
