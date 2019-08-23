class GeneViewerService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  async get(pog, report, gene) {
    const { data } = await this.$http.get(
      `${this.api}/${pog}/report/${report}/geneviewer/${gene}`,
    );
    return data;
  }
}

export default GeneViewerService;
