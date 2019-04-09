class ProbeTestInformationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieve test information for a report
   *
   * @param {String} POGID - patient identifier
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(POGID, report) {
    const { data } = await this.$http.get(`${this.api}/${POGID}/report/${report}/probe/testInformation`);
    return data;
  }
}
  
export default ProbeTestInformationService;
