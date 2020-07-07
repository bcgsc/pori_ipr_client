class GeneService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async update(report, geneName, gene) {
    const geneNameEncoded = encodeURIComponent(geneName);
    return this.$http.put(
      `${this.api}/${report}/genes/${geneNameEncoded}`,
      gene,
    );
  }
}

export default GeneService;
