import { $http } from 'ngimport';

class GermlineService {
  constructor() {
    this.baseApi = window._env_.API_BASE_URL;
    this.api = `${window._env_.API_BASE_URL}/germline-small-mutation-reports`;
  }

  /**
   * Retrieves all small mutation reports
   * @param {Object} opts - optional parameters to include in query
   * @returns {Promise} - resolves with object of {total: int, reports: [{collection},{},...]}
   */
  async getAllReports(opts = {}) {
    const { data } = await $http.get(this.api, { params: opts });
    return data;
  }

  /**
   * Retrieves a single report
   * @param {String} report - report uuid
   * @returns {Promise} - result of API call
   */
  async getReport(report) {
    const { data } = await $http.get(
      `${this.api}/${report}`,
    );
    return data;
  }

  /**
   * Update a report
   * @param {String} report - report uuid
   * @param {Object} payload - updated report data payload
   * @returns {Promise/array} - result of API call
   */
  async updateReport(report, payload) {
    const { data } = await $http.put(
      `${this.api}/${report}`,
      payload,
    );
    return data;
  }

  /**
   * Delete a report
   * @param {String} report - report uuid
   * @returns {Promise/array} - result of API call
   */
  async deleteReport(report) {
    const { data } = await $http.delete(
      `${this.api}/${report}`,
    );
    return data;
  }

  /**
   * Add review to a report
   * @param {String} report - report uuid
   * @param {Object} payload - review body payload
   * @returns {Promise} - created review object
   */
  async addReview(report, payload) {
    const { data } = await $http.post(
      `${this.api}/${report}/reviews`,
      payload,
    );
    return data;
  }

  /**
   * Remove review from a report
   * @param {String} report - report uuid
   * @param {String} review - ident of the review to remove
   * @returns {Promise} - result of API call
   */
  async removeReview(report, review) {
    const { data } = await $http.delete(
      `${this.api}/${report}/reviews/${review}`,
    );
    return data;
  }

  /**
   * Update a variant
   * @param {String} report - report uuid
   * @param {String} variant - variant uuid
   * @param {Object} payload - variant body payload
   * @returns {Promise} - variant object
   */
  async updateVariant(report, variant, payload) {
    const { data } = await $http.put(
      `${this.api}/${report}/variants/${variant}`,
      payload,
    );
    return data;
  }
}

export default new GermlineService();
