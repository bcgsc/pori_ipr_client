class AlterationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  baseUrl(report, type) {
    return `${this.api}/${report}/${type}${
      type === 'genomic'
        ? '/detailed-genomic-analysis'
        : ''
    }/alterations`;
  }

  /**
   * Retrieve all probe alterations for report
   *
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   *
   * @returns {Promise} - result of API call
   */
  async getAll(report, type) {
    const { data } = await this.$http.get(this.baseUrl(report, type));
    return data;
  }

  /**
   * Update probe alteration for report
   *
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async update(report, type, ident, payload) {
    const { data } = await this.$http.put(
      `${this.baseUrl(report, type)}/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Create new probe alteration for report
   *
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async create(report, type, ident, payload) {
    const { data } = await this.$http.post(
      `${this.baseUrl(report, type)}/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Retrieve all probe alterations for report by type
   *
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   * @param {String} alterationType - alteration type
   *
   * @returns {Promise} - result of API call
   */
  async getType(report, type, alterationType) {
    const { data } = await this.$http.get(
      `${this.baseUrl(report, type)}/${alterationType}`,
    );
    return data;
  }
}

export default AlterationService;
