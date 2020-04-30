class GeneViewerService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async get(report, gene) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/gene-viewer/${gene}`,
    );
    return data;
  }
}

export default GeneViewerService;
