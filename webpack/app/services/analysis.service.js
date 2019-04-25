class AnalysisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = CONFIG.ENDPOINTS.API;
  }

  /**
    * Retrieve all analyses that user can access with options
    * @param {Object} params - Object with params
    * @return {Promise} Resolves with array of reports
    * @throws {ErrorType} Thrown when API call fails
    */
  async getAllAnalyses(params = {}) {
    const opts = { params };
    const { data } = await this.$http.get(`${this.api}/analysis`, opts);
    return data;
  }
  
  /**
    * Retrieve extended data for one analysis
    * @param {String} ident - The analysis ident UUID string
    * @return {Promise} Extended analysis details
    * @throws {ErrorType} Thrown when API call fails
    */
  async getExtendedAnalysis(ident) {
    const { data } = await this.$http.get(`${this.api}/analysis/extended/${ident}`);
    return data;
  }
  
  /**
    * Add new analysis entry
    * @param {Object} analysis - Analysis object to be added
    * @returns {Promise} Result of add analysis API call
    * @throws {ErrorType} Thrown when API call fails
    */
  async addAnalysis(analysis) {
    const { data } = await this.$http.post(`${this.api}/analysis`, analysis);
    return data;
  }

  /**
    * Update analysis entry
    * @param {Object} analysis - Analysis object to be added
    * @returns {Promise} Result of update analysis API call
    * @throws {ErrorType} Thrown when API call fails
    */
  async updateAnalysis(analysis) {
    const payload = angular.copy(analysis);
    if (payload.analysis && Array.isArray(payload.analysis)) delete payload.analysis;

    const { data } = await this.$http.put(`${this.api}/analysis/${analysis.ident}`, analysis);
    return data;
  }

  /**
    * Retrieve analysis comparators list
    * @returns {Promise} Resolves with hashmap of comparators
    * @throws {ErrorType} Thrown when API call fails
    */
  async getComparators() {
    const { data } = await this.$http.get(`${this.api}/analysis/comparators`);
    return data;
  }
}
  
export default AnalysisService;
