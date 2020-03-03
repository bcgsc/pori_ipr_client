class MutationSummaryService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get Genomic Events with Therapeutic Association
   * @param {String} report - report ident
   * @return {Promise} API response value
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    const resp = await this.$http.get(
      `${this.api}/${report}/genomic/summary/mutation-summary`,
    );
    return resp.data;
  }

  /**
   * Update an Genomic Event with Therapeutic Association
   * @param {String} report - report ident
   * @param {*} summary - summary
   * @return {Promise} API response value
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(report, summary) {
    const resp = await this.$http.put(
      `${this.api}/${report}/genomic/summary/mutation-summary`, summary,
    );
    return resp.data;
  }
}

export default MutationSummaryService;
