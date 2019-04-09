class PathwayAnalysisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieves pathway analysis for report
   *
   * @param {String} POGID  - patient identifier
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(POGID, report) {
    const { data } = await this.$http.get(`${this.api}/${POGID}/report/${report}/genomic/summary/pathwayAnalysis`);
    return data;
  }

  /**
   * Updates pathway analysis for report
   *
   * @param {String} POGID  - patient identifier
   * @param {String} report - report ident
   * @param {Object} summary - object payload
   *
   * @returns {Promise} - result of API call
   */
  async update(POGID, report, summary) {
    const { data } = await this.$http.put(`${this.api}/${POGID}/report/${report}/genomic/summary/pathwayAnalysis`, summary);
    return data;
  }
}
  
export default PathwayAnalysisService;
