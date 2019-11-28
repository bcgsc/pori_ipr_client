class AlterationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieve all probe alterations for report
   *
   * @param {String} patient - patient identifier
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   *
   * @returns {Promise} - result of API call
   */
  async getAll(patient, report, type) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/${type}/detailedGenomicAnalysis/alterations`,
    );
    return data;
  }

  /**
   * Update probe alteration for report
   *
   * @param {String} patient - patient identifier
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async update(patient, report, type, ident, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${patient}/report/${report}/${type}/detailedGenomicAnalysis/alterations/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Create new probe alteration for report
   *
   * @param {String} patient - patient identifier
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async create(patient, report, type, ident, payload) {
    const { data } = await this.$http.post(
      `${this.api}/${patient}/report/${report}/${type}/detailedGenomicAnalysis/alterations/${ident}`,
      payload,
    );
    return data;
  }
  
  /**
   * Retrieve all probe alterations for report by type
   *
   * @param {String} patient - patient identifier
   * @param {String} report - report ident
   * @param {String} type - report type eg. genomic
   * @param {String} alterationType - alteration type
   *
   * @returns {Promise} - result of API call
   */
  async getType(patient, report, type, alterationType) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/${type}/detailedGenomicAnalysis/alterations/${alterationType}`,
    );
    return data;
  }
}
  
export default AlterationService;
