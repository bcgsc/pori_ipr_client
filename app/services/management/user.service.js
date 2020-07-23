import { $http } from 'ngimport';

class UserService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/user`;
  }
  
  /**
   * Get all users (admin)
   * @return {Promise} all promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async all() {
    const { data } = await $http.get(this.api);
    return data;
  }

  /**
   * Update a user entry
   * @param {Object} user object to update
   * @return {Promise} update response
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(user) {
    const { data } = await $http.put(`${this.api}/${user.ident}`, user);
    return data;
  }
  

  /**
   * Create a new user account
   * @param {Object} user object to create
   * @returns {Promise} create response
   * @throws {ErrorType} Thrown when API call fails
   */
  async create(user) {
    const { data } = await $http.post(`${this.api}/`, user);
    return data;
  }

  /**
   * Search for a user
   * @param {String} query - user to search for
   * @return {Promise} Search results
   * @throws {ErrorType} Thrown when API call fails
   */
  async search(query) {
    const { data } = await $http.get(`${this.api}/search`, { params: { query } });
    return data;
  }

  /**
   * Remove a user
   * @param {String} user - user to remove
   * @return {Promise} Removal response
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(user) {
    const { data } = await $http.delete(`${this.api}/${user.ident}`);
    return data;
  }
}

export default new UserService();
