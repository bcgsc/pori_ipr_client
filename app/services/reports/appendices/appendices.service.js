class AppendicesService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get TCGA appendices
   * @param {String} report - report ident
   * @return {Promise} API response data
   */
  async tcga(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/genomic/appendices/tcga`,
    );
    return data;
  }
}

export default AppendicesService;
