class ProbeSignatureService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieve probe signature details
   *
   * @param {String} POGID - patient identifier
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(POGID, report) {
    const { data } = this.$http.get(`${this.api}/${POGID}/report/${report}/probe/signature`);
    return data;
  }

  /**
   * Sign probe report
   *
   * @param {String} POGID - patient identifier
   * @param {String} report - report ident
   * @param {String} role - role to sign with
   *
   * @returns {Promise} - result of API call
   */
  async sign(POGID, report, role) {
    const { data } = this.$http.put(`${this.api}/${POGID}/report/${report}/probe/signature/${role}`, {});
    return data;
  }

  /**
   * Revoke signature from probe report
   *
   * @param {String} POGID - patient identifier
   * @param {String} report - report ident
   * @param {String} role - role to revoke signature of
   *
   * @returns {Promise} - result of API call
   */
  async revoke(POGID, report, role) {
    const { data } = this.$http.put(`${this.api}/${POGID}/report/${report}/probe/signature/revoke/${role}`, {});
    return data;
  }
}
  
export default ProbeSignatureService;
