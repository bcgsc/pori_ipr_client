class AlterationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  baseUrl(report) {
    return `${this.api}/${report}/kb-matches`;
  }

  /**
   * Retrieve all probe alterations for report
   *
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async getAll(report) {
    const { data } = await this.$http.get(this.baseUrl(report));
    return data;
  }

  /**
   * Update probe alteration for report
   * Not actually used anywhere anymore
   *
   * @param {String} report - report ident
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async update(report, ident, payload) {
    const { data } = await this.$http.put(
      `${this.baseUrl(report)}/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Create new probe alteration for report
   *
   * @param {String} report - report ident
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async create(report, ident, payload) {
    const { data } = await this.$http.post(
      `${this.baseUrl(report)}/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Retrieve all probe alterations for report by type
   *
   * @param {String} report - report ident
   * @param {String} alterationType - alteration type
   *
   * @returns {Promise} - result of API call
   */
  async getType(report, alterationType) {
    const { data } = await this.$http.get(
      `${this.baseUrl(report)}/${alterationType}`,
    );
    return data;
  }
}

export default AlterationService;
