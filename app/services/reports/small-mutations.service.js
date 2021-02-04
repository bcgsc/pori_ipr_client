import { $http } from 'ngimport';

class SmallMutationsService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Get all small mutations
   * @param {String} report - report ident
   * @return {Promise} API response data
   */
  async all(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/small-mutations`,
    );
    return data;
  }

  /**
   * Update mutations
   * @param {String} report - report ident
   * @param {String} ident - UUID ident
   * @param {*} payload - Update data
   * @return {Promise} API response data
   */
  async update(report, ident, payload) {
    const { data } = await $http.put(
      `${this.api}/${report}/small-mutations/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get alterations by specific type
   * @param {String} report - report ident
   * @param {String} type - type to retrieve
   * @return {Promise} API response data
   */
  async getType(report, type) {
    const { data } = await $http.get(
      `${this.api}/${report}/small-mutations/${type}`,
    );
    return data;
  }
}

export default new SmallMutationsService();
