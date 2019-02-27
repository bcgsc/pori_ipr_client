class MicrobialService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Get Microbial Content
   * @param {String} pogID - PogID of requested resource, eg. POG129
   * @param {String} report - Report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID, report) {
    this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/microbial`,
    );
  }
}

export default MicrobialService;
