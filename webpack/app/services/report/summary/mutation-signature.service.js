class MutationSignatureService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieves all mutation signatures for a given pogID
   * @param {String} pogID - ID as String
   * @param {String} report - report ident String
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(pogID, report) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/somaticMutations/mutationSignature`,
    );
    return resp.data;
  }
}

export default MutationSignatureService;
