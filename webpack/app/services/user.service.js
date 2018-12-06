/**
 * All API calls relating to user object
 * @param {*} _ {@link https://lodash.com/docs/4.17.10}
 * @param {*} $http {@link https://docs.angularjs.org/api/ng/service/$http}
 * @return {Object} $user service object
 */
class UserService {
  constructor(_, $http) {
    'ngInject';

    this._ = _;
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/user`;
    this.meObj = {};
  }
  
  /**
   * Retrieves the user object if authenticated
   * @return {Promise} User object
   * @throws {ErrorType} Thrown when API call fails
   */
  async me() {
    const resp = await this.$http.get(`${this.api}/me`);
    this.meObj = resp.data;
    return this.meObj;
  }
  
  /**
   * Check if user is an admin or superuser
   * @return {Promise} admin bool
   * @throws {ErrorType} Thrown when API call fails
   */
  async isAdmin() {
    return this.meObj.groups.some(({ name }) => {
      return ['superUser', 'admin'].includes(name);
    });
  }

  /**
   * Get all users (admin)
   * @return {Promise} all promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async all() {
    const resp = await this.$http.get(this.api);
    return resp.data;
  }

  /**
   * Update a user entry
   * @param {Object} user object to update
   * @return {Promise} update response
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(user) {
    const resp = await this.$http.put(`${this.api}/${user.ident}`, user);
    return resp.data;
  }

  /**
   * Create a new user account
   * @param {Object} user object to create
   * @returns {Promise} create response
   * @throws {ErrorType} Thrown when API call fails
   */
  async create(user) {
    const resp = await this.$http.post(`${this.api}/`, user);
    return resp.data;
  }

  /**
   * Search for a user
   * @param {String} query - user to search for
   * @return {Promise} Search results
   * @throws {ErrorType} Thrown when API call fails
   */
  async search(query) {
    const resp = await this.$http.get(`${this.api}/search`, { params: { query } });
    return resp.data;
  }

  /**
   * Remove a user
   * @param {String} user - user to remove
   * @return {Promise} Removal response
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(user) {
    const resp = await this.$http.delete(`${this.api}/${user.ident}`);
    return resp.data;
  }
}

export default UserService;
