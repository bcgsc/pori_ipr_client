class MavisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get all Mavis results
   * @param {String} patient - patient ID
   * @param {String} report - report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/mavis`,
    );
    return data;
  }
}

export default MavisService;
