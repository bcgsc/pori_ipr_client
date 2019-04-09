class GermlineService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/germline_small_mutation`;
  }

  /**
   * Retrieves all small mutation reports
   *
   * @param {Object} params - parameters to include in query
   * @returns {Promise} - resolves with object of {total: int, reports: [{collection},{},...]}
   */
  async getAllReports(params = {}) {
    const { data } = await this.$http.get(this.api, { params });
    return data;
  }

  /**
   * Retrieve all reports for a given biopsy
   *
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy number
   * @param {Object} params - parameters to include in query
   *
   * @returns {Promise} - resolves with array of reports
   */
  async getReportForBiopsy(patient, biopsy, params = {}) {
    const resp = await this.$http.get(`${this.api}/patient/${patient}/biopsy/${biopsy}`, { params });
    return resp;
  }

  /**
   * Retrieves a single report
   *
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy number
   * @param {String} report - report uuid
   * @param {Object} params - parameters to include in query
   *
   * @returns {Promise} - result of API call
   */
  async getReport(patient, biopsy, report, params = {}) {
    const { data } = await this.$http.get(`${this.api}/patient/${patient}/biopsy/${biopsy}/report/${report}`, { params });
    return data;
  }

  /**
   * Update a report
   *
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy number
   * @param {String} report - report uuid
   * @param {Object} payload - updated report data payload
   * @param {Object} params - parameters to include in query
   *
   * @returns {Promise/array} - result of API call
   */
  async updateReport(patient, biopsy, report, payload, params = {}) {
    const { data } = await this.$http.put(`${this.api}/patient/${patient}/biopsy/${biopsy}/report/${report}`, payload, { params });
    return data;
  }

  /**
   * Delete a report
   *
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy number
   * @param {String} report - report uuid
   *
   * @returns {Promise/array} - result of API call
   */
  async deleteReport(patient, biopsy, report) {
    const { data } = await this.$http.delete(`${this.api}/patient/${patient}/biopsy/${biopsy}/report/${report}`);
    return data;
  }

  /**
   * Retrieve a flash token to download a report
   *
   * @returns {Promise} - token object
   */
  async getFlashToken() {
    const { data } = await this.$http.get(`${this.api}/export/batch/token`);
    return data;
  }

  /** Add review to a report
   *
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy name
   * @param {String} report - report uuid
   * @param {Object} payload - review body payload
   *
   * @returns {Promise} - created review object
   */
  async addReview(patient, biopsy, report, payload) {
    const { data } = await this.$http.put(`${this.api}/patient/${patient}/biopsy/${biopsy}/report/${report}/review`, payload);
    return data;
  }

  /** Remove review from a report
   *
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy name
   * @param {String} report - report uuid
   *
   * @returns {Promise} - result of API call
   */
  async removeReview(patient, biopsy, report) {
    const { data } = await this.$http.delete(`${this.api}/patient/${patient}/biopsy/${biopsy}/report/${report}/review`);
    return data;
  }

  /**
   * Get a variant
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy name
   * @param {String} report - report uuid
   * @param {String} variant - variant uuid
   *
   * @returns {Promise} - variant object
   */
  async getVariant(patient, biopsy, report, variant) {
    const resp = this.$http.get(`${this.api}/patient/${patient}/biopsy/${biopsy}/report/${report}/variant/${variant}`);
    return resp;
  }

  /**
   * Update a variant
   * @param {String} patient - patient identifier
   * @param {String} biopsy - biopsy name
   * @param {String} report - report uuid
   * @param {String} variant - variant uuid
   * @param {Object} payload - variant body payload
   *
   * @returns {Promise} - variant object
   */
  async updateVariant(patient, biopsy, report, variant) {
    const { data } = this.$http.put(`${this.api}/patient/${patient}/biopsy/${biopsy}/report/${report}/variant/${variant}`, payload);
    return data;
  }
}
  
export default GermlineService;
