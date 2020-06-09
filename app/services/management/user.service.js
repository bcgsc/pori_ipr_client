import { $http } from 'ngimport';

/**
 * All API calls relating to user object
 * @param {*} $http {@link https://docs.angularjs.org/api/ng/service/$http}
 * @return {Object} $user service object
 */
class UserService {
  /* @ngInject */
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/user`;
    this.sidebarOpen = false;
  }
  
  /**
   * Retrieves the user object if authenticated
   * @return {Promise} User object
   * @throws {ErrorType} Thrown when API call fails
   */
  async me() {
    const { data } = await $http.get(`${this.api}/me`);
    return data;
  }
  
  /**
   * Check if user is an admin or superuser
   * @return {Promise} admin bool
   * @throws {ErrorType} Thrown when API call fails
   */
  async isAdmin() {
    const user = await this.me();
    return user.groups.some(({ name }) => ['superUser', 'admin'].includes(name));
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
   * Get a setting based on the name
   * @param {String} settingName name of setting
   * @return {Promise<String>} Setting value
   */
  async getSetting(settingName) {
    const user = await this.me();
    return user.settings[settingName];
  }

  /**
   * Save a setting value through the API
   * @param {String} settingName - Name of setting to update
   * @param {*} newValue - New setting value
   * @return {Promise<Object>} Updated user
   */
  async saveSetting(settingName, newValue) {
    const user = await this.me();
    user.settings[settingName] = newValue;
    return this.update(user);
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

  /**
   * Toggle the sidebar state
   * @return {Boolean} State of sidebar after toggle
   */
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    return this.sidebarOpen;
  }

  /**
   * Return the sidebar state
   * @return {Boolean} State of sidebar
   */
  getSidebarState() {
    return this.sidebarOpen;
  }
}

export default UserService;

const api = `${CONFIG.ENDPOINTS.API}/user`;
let sidebarOpen = false;

export const getCurrentUser = async () => {
  try {
    const resp = await $http.get(`${api}/me`);
    return resp;
  } catch (err) {
    return null;
  }
};

export const isAdmin = async () => {
  const user = await getCurrentUser();
  return user.groups.some(({ name }) => name === 'admin');
};

export const getSidebarState = () => sidebarOpen;

export const toggleSidebarState = () => {
  sidebarOpen = !sidebarOpen;
  return sidebarOpen;
};
