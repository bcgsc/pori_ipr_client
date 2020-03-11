class TumourAnalysisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * @param {String} report - analysis_report string
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    const resp = await this.$http.get(
      `${this.api}/${report}/summary/tumour-analysis`,
    );
    return resp.data;
  }

  /**
   * @param {String} report - analysis_report string
   * @param {Object} analysis - analysis object
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(report, analysis) {
    const resp = await this.$http.put(
      `${this.api}/${report}/summary/tumour-analysis/`, analysis,
    );
    return resp.data;
  }
}

export default TumourAnalysisService;
