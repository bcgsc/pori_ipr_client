class MicrobialService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get Microbial Content
   * @param {String} report - Report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    this.$http.get(
      `${this.api}/${report}/summary/microbial`,
    );
  }
}

export default MicrobialService;
