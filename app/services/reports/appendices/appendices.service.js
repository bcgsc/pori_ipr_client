class AppendicesService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get TCGA appendices
   * @param {String} patient - patient id as String ie: POG123
   * @param {String} report - report ident
   * @return {Promise} API response data
   */
  async tcga(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/appendices/tcga`,
    );
    return data;
  }
}

export default AppendicesService;
