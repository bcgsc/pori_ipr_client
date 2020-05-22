class GermlineService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.baseApi = CONFIG.ENDPOINTS.API;
    this.api = `${CONFIG.ENDPOINTS.API}/germline-small-mutation-reports`;
  }

  /**
   * Retrieves all small mutation reports
   * @param {Object} opts - optional parameters to include in query
   * @returns {Promise} - resolves with object of {total: int, reports: [{collection},{},...]}
   */
  async getAllReports(opts = {}) {
    const { data } = await this.$http.get(this.api, { params: opts });
    return data;
  }

  /**
   * Retrieves a single report
   * @param {String} report - report uuid
   * @returns {Promise} - result of API call
   */
  async getReport(report) {
    const { data } = await this.$http.get(
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
    const { data } = await this.$http.put(
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
    const { data } = await this.$http.delete(
      `${this.api}/${report}`,
    );
    return data;
  }

  async export(opts = { reviews: 'biofx,projects' }) {
    const response = await this.$http.get(
      `${this.baseApi}/export/germline-small-mutation-reports/batch/download`,
      { params: opts },
    );
    console.log(response);
    return response;
  }

  /**
   * Add review to a report
   * @param {String} report - report uuid
   * @param {Object} payload - review body payload
   * @returns {Promise} - created review object
   */
  async addReview(report, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/review`,
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
    const { data } = await this.$http.delete(
      `${this.api}/${report}/review/${review}`,
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
    const { data } = await this.$http.put(
      `${this.api}/${report}/variant/${variant}`,
      payload,
    );
    return data;
  }
}

export default GermlineService;
