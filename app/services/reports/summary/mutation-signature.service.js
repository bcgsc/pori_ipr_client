class MutationSignatureService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieves all mutation signatures for a given pogID
   * @param {String} report - report ident String
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(report) {
    const resp = await this.$http.get(
      `${this.api}/${report}/somatic-mutations/mutation-signature`,
    );
    return resp.data;
  }
}

export default MutationSignatureService;
