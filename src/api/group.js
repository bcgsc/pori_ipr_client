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
    const resp = await $http.get(`${api}/group`);
    return resp.data;
  }

  /**
   * Retrieve group
   * @param {String} ident - Group UUID ident
   * @return {Promise} Retrieve response
   */
  async function retrieve(ident) {
    const resp = await $http.get(`${api}/group/${ident}`);
    return resp.data;
  }

  /**
   * Create new group
   * @param {String} group - Group UUID ident
   * @return {Promise} Group response
   */
  async function create(group) {
    const resp = await $http.post(`${api}/group`, group);
    return resp.data;
  }

  /**
   * Remove a group
   * @param {String} group - Group UUID ident
   * @return {Promise} Remove response
   */
  async function remove(group) {
    const resp = await $http.delete(`${api}/group/${group.ident}`);
    return resp.data;
  }

  /**
   * Update a group
   * @param {String} ident - Group UUID ident
   * @param {Object} group - Group object to be updated
   * @returns {Promise} Update response
   */
  async function update(ident, group) {
    const resp = await $http.put(`${api}/group/${ident}`, group);
    return resp.data;
  }

  /**
   * Add a user to a group
   * @param {String} group - Group UUID ident
   * @param {String} user - User UUID ident
   * @return {Promise} Add user response
   */
  async function addUser(group, user) {
    const resp = await $http.post(`${api}/group/${group}/member`, { user });
    return resp.data;
  }

  /**
   * Remove a user from a group
   * @param {String} group - Group UUID ident
   * @param {String} user - User UUID ident
   * @return {Promise} Remove user response
   */
  async function removeUser(group, user) {
    const resp = await $http.delete(`${api}/group/${group}/member`, {
      data: { user },
      headers: { 'Content-Type': 'application/json' },
    });
    return resp.data;
  }
}

userGroup.$inject = ['$http'];

angular
  .module('bcgscIPR')
  .service('api.group', userGroup);
