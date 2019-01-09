class tumourAnalysis {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * 
   * @param {String} POGID - POGID as string
   * @param {String} report - analysis_report string
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(POGID, report) {
    const resp = await this.$http.get(`${this.api}/${POGID}/report/${report}/genomic/summary/tumourAnalysis`);
    return resp.data;   
  }
  
  /**
   * 
   * @param {String} POGID - POGID as string
   * @param {String} report - analysis_report string
   * @param {Object} analysis - analysis object
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(POGID, report, analysis) {
    const resp = await this.$http.put(`${this.api}/${POGID}/report/${report}/genomic/summary/tumourAnalysis/`, analysis);
    return resp.data;
  }
}

export default tumourAnalysis;
