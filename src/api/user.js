/**
 * All API calls relating to user object
 * @param {*} _ {@link https://lodash.com/docs/4.17.10}
 * @param {*} $http {@link https://docs.angularjs.org/api/ng/service/$http}
 * @return {Object} $user service object
 */
function apiUser(_, $http) {
  const api = `${CONFIG.ENDPOINTS.API}/user`;

  const $user = {
    me,
    isAdmin,
    all,
    update,
    create,
    search,
    remove,
  };
  return $user;
  
  /**
   * Retrieves the user object if authenticated
   * @return {Promise} User object
   * @throws {ErrorType} Thrown when API call fails
   */
  async function me() {
    const resp = await $http.get(`${api}/me`);
    $user.meObj = resp.data;
    return $user.meObj;
  }
  
  /**
   * Check if user is an admin or superuser
   * @return {Promise} admin bool
   * @throws {ErrorType} Thrown when API call fails
   */
  async function isAdmin() {
    return $user.meObj.groups.some(({ name }) => {
      return ['superUser', 'admin'].includes(name);
    });
  }

  /**
   * Get all users (admin)
   * @return {Promise} all promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async function all() {
    const resp = await $http.get(api);
    return resp.data;
  }

  /**
   * Update a user entry
   * @param {Object} user object to update
   * @return {Promise} update response
   * @throws {ErrorType} Thrown when API call fails
   */
  async function update(user) {
    const resp = await $http.put(`${api}/${user.ident}`, user);
    return resp.data;
  }

  /**
   * Create a new user account
   * @param {Object} user object to create
   * @returns {Promise} create response
   * @throws {ErrorType} Thrown when API call fails
   */
  async function create(user) {
    const resp = await $http.post(`${api}/`, user);
    return resp.data;
  }

  /**
   * Search for a user
   * @param {String} query - user to search for
   * @return {Promise} Search results
   * @throws {ErrorType} Thrown when API call fails
   */
  async function search(query) {
    const resp = await $http.get(`${api}/search`, { params: { query } });
    return resp.data;
  }

  /**
   * Remove a user
   * @param {String} user - user to remove
   * @return {Promise} Removal response
   * @throws {ErrorType} Thrown when API call fails
   */
  async function remove(user) {
    const resp = await $http.delete(`${api}/${user.ident}`);
    return resp.data;
  }
}

apiUser.$inject = ['_', '$http'];

angular
  .module('bcgscIPR')
  .service('api.user', apiUser);
