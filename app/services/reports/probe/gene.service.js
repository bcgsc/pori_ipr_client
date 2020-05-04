class GeneService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async update(report, geneName, gene) {
    return this.$http.put(
      `${this.api}/${report}/genes/${geneName}`,
      gene,
    );
  }
}

export default GeneService;
