class ProbeSignatureService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieve probe signature details
   *
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/probe/signature`,
    );
    return data;
  }

  /**
   * Sign probe report
   *
   * @param {String} report - report ident
   * @param {String} role - role to sign with
   *
   * @returns {Promise} - result of API call
   */
  async sign(report, role) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/probe/signature/${role}`,
      {},
    );
    return data;
  }

  /**
   * Revoke signature from probe report
   *
   * @param {String} report - report ident
   * @param {String} role - role to revoke signature of
   *
   * @returns {Promise} - result of API call
   */
  async revoke(report, role) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/probe/signature/revoke/${role}`,
      {},
    );
    return data;
  }
}

export default ProbeSignatureService;
