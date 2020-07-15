class SignatureService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async getSignatures(reportIdent) {
    const resp = await this.$http.get(`${this.api}/${reportIdent}/signatures`);
    return resp.data;
  }

  async sign(reportIdent, role) {
    const resp = await this.$http.put(`${this.api}/${reportIdent}/signatures/sign/${role}`);
    return resp.data;
  }

  async revoke(reportIdent, role) {
    const resp = await this.$http.put(`${this.api}/${reportIdent}/signatures/revoke/${role}`);
    return resp.data;
  }
}

export default SignatureService;
