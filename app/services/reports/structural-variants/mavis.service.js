class MavisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get all Mavis results
   * @param {String} report - report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/mavis`,
    );
    return data;
  }
}

export default MavisService;
