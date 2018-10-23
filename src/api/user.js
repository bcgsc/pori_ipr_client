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
   * @return {Object} User object
   */
  async function me() {
    try {
      const resp = await $http.get(`${api}/me`);
      $user.meObj = resp.data;
      return $user.meObj;
    } catch (err) {
      return err;
    }
  }
  
  /**
   * Check if user is an admin or superuser
   * @return {Boolean} admin bool
   */
  function isAdmin() {
    return $user.meObj.groups.some(({ name }) => {
      return ['superUser', 'admin'].includes(name);
    });
  }

  /**
   * Get all users (admin)
   * @return {Promise} all promise
   */
  async function all() {
    try {
      const resp = await $http.get(api);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Update a user entry
   * @param {Object} user object to update
   * @return {Promise} update response
   */
  async function update(user) {
    try {
      const resp = await $http.put(`${api}/${user.ident}`, user);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Create a new user account
   * @param {Object} user object to create
   * @returns {Promise} create response
   */
  async function create(user) {
    try {
      const resp = await $http.post(`${api}/`, user);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Search for a user
   * @param {String} query - user to search for
   * @return {Promise} Search results
   */
  async function search(query) {
    try {
      const resp = await $http.get(`${api}/search`, { params: { query } });
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Remove a user
   * @param {String} user - user to remove
   * @return {Promise} Removal response
   */
  async function remove(user) {
    try {
      const resp = await $http.delete(`${api}/${user.ident}`);
      return resp.data;
    } catch (err) {
      return err;
    }
  }
}

apiUser.$inject = ['_', '$http'];

angular
  .module('bcgscIPR')
  .service('api.user', apiUser);
