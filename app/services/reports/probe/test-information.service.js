class ProbeTestInformationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieve test information for a report
   *
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/probe-test-information`,
    );
    return data;
  }
}

export default ProbeTestInformationService;
