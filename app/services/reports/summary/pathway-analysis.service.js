class PathwayAnalysisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieves pathway analysis for report
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/summary/pathway-analysis`,
    );
    return data;
  }

  /**
   * Updates pathway analysis for report
   * @param {String} report - report ident
   * @param {Object} summary - object payload
   *
   * @returns {Promise} - result of API call
   */
  async update(report, summary) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/summary/pathway-analysis`,
      summary,
    );
    return data;
  }
}

export default PathwayAnalysisService;
