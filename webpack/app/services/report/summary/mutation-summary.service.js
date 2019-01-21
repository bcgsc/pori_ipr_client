class MutationSummaryService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Get Genomic Events with Therapeutic Association
   * @param {String} pogID - pogID as String
   * @param {String} report - report ident
   * @return {Promise} API response value
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID, report) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/mutationSummary`,
    );
    return resp.data;
  }
  
  /**
   * Update an Genomic Event with Therapeutic Association
   * @param {String} pogID - pogID as string
   * @param {String} report - report ident
   * @param {*} summary - summary
   * @return {Promise} API response value
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pogID, report, summary) {
    const resp = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/mutationSummary`, summary,
    );
    return resp.data;
  }
}

export default MutationSummaryService;
