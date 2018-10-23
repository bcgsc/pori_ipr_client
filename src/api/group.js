/**
 * API calls relating to user groups
 * @param {*} $http {@link https://docs.angularjs.org/api/ng/service/$http}
 * @return {Object} $group service object
 */
function userGroup($http) {
  const api = `${CONFIG.ENDPOINTS.API}/user`;

  const $groups = {
    all,
    retrieve,
    create,
    remove,
    update,
    addUser,
    removeUser,
  };
  return $groups;

  /**
   * Get all groups
   * @return {Promise} All response
   */
  async function all() {
    try {
      const resp = await $http.get(`${api}/group`);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Retrieve group
   * @param {String} ident - Group UUID ident
   * @return {Promise} Retrieve response
   */
  async function retrieve(ident) {
    try {
      const resp = await $http.get(`${api}/group/${ident}`);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Create new group
   * @param {String} group - Group UUID ident
   * @return {Promise} Group response
   */
  async function create(group) {
    try {
      const resp = await $http.post(`${api}/group`, group);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Remove a group
   * @param {String} group - Group UUID ident
   * @return {Promise} Remove response
   */
  async function remove(group) {
    try {
      const resp = await $http.delete(`${api}/group/${group.ident}`);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Update a group
   * @param {String} ident - Group UUID ident
   * @param {Object} group - Group object to be updated
   * @returns {Promise} Update response
   */
  async function update(ident, group) {
    try {
      const resp = await $http.put(`${api}/group/${ident}`, group);
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Add a user to a group
   * @param {String} group - Group UUID ident
   * @param {String} user - User UUID ident
   * @return {Promise} Add user response
   */
  async function addUser(group, user) {
    try {
      const resp = await $http.post(`${api}/group/${group}/member`, { user });
      return resp.data;
    } catch (err) {
      return err;
    }
  }

  /**
   * Remove a user from a group
   * @param {String} group - Group UUID ident
   * @param {String} user - User UUID ident
   * @return {Promise} Remove user response
   */
  async function removeUser(group, user) {
    try {
      const resp = await $http.delete(`${api}/group/${group}/member`, { user });
      return resp.data;
    } catch (err) {
      return err;
    }
  }
}

userGroup.$inject = ['$http'];

angular
  .module('bcgscIPR')
  .service('api.group', userGroup);
