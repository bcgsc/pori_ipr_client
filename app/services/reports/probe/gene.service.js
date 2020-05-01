class GeneService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async update(report, geneName, gene) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/genes/${geneName}`,
      gene,
    );
    return data;
  }
}

export default GeneService;
