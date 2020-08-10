import { $http } from 'ngimport';

class DiscussionService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get All Discussion notes
   *
   * @param {string} report - Report Ident
   *
   * @returns {Promise} - Resolves with all entries
   */
  async all(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/presentation/discussion`,
    );
    return data;
  }

  /**
   * Create new discussion entry
   *
   * @param {string} report - Report Ident
   * @param {object} entry - New entry data object
   *
   * @returns {Promise} - Resolves with new entry
   */
  async create(report, entry) {
    const { data } = await $http.post(
      `${this.api}/${report}/presentation/discussion`, entry,
    );
    return data;
  }

  /**
   * Get a discussion entry
   *
   * @param {string} report - Report Ident
   * @param {string} ident - Report ident string
   *
   * @returns {Promise} - Resolves with updated entry
   */
  async get(report, ident) {
    const { data } = await $http.get(
      `${this.api}/${report}/presentation/discussion/${ident}`,
    );
    return data;
  }

  /**
   * Update an existing discussion entry
   *
   * @param {string} report - Report Ident
   * @param {string} ident - Report ident string
   * @param {object} entry - data object of entry
   *
   * @returns {Promise} - Resolves with updated entry
   */
  async update(report, ident, entry) {
    const { data } = await $http.put(
      `${this.api}/${report}/presentation/discussion/${ident}`, entry,
    );
    return data;
  }

  /**
   * Remove an existing discussion entry
   *
   * @param {string} report - Report Ident
   * @param {string} ident - Report ident string
   *
   * @returns {Promise} - Resolves with updated entry
   */
  async remove(report, ident) {
    const { data } = await $http.delete(
      `${this.api}/${report}/presentation/discussion/${ident}`,
    );
    return data;
  }
}

export default new DiscussionService();
