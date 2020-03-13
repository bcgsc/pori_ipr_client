class VariantCountsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get Variant Counts
   * @param {String} report - report ident
   * @return {Promise} API reponse as promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    const resp = await this.$http.get(
      `${this.api}/${report}/summary/variant-counts`,
    );
    return resp.data;
  }


  /**
   * Update Variant Counts
   * @param {String} report - report ident
   * @param {Object} analysis - analysis object
   * @return {Promise} API response as promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(report, analysis) {
    const resp = await this.$http.put(
      `${this.api}/${report}/summary/variant-counts/`,
      analysis,
    );
    return resp.data;
  }
}

export default VariantCountsService;
