class ProbeTestInformationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieve test information for a report
   *
   * @param {String} patient - patient identifier
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/probe/testInformation`,
    );
    return data;
  }
}
  
export default ProbeTestInformationService;
