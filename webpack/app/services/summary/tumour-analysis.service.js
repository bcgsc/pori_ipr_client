class TumourAnalysisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * @param {String} pogID - pogID as string
   * @param {String} report - analysis_report string
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID, report) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/tumourAnalysis`,
    );
    return resp.data;
  }
  
  /**
   * @param {String} pogID - pogID as string
   * @param {String} report - analysis_report string
   * @param {Object} analysis - analysis object
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pogID, report, analysis) {
    const resp = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/tumourAnalysis/`, analysis,
    );
    return resp.data;
  }
}

export default TumourAnalysisService;
