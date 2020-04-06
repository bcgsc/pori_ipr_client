class TargetedGenesService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async getAll(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/probe-results`,
    );
    return data;
  }

  async update(report, geneId, gene) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/probe-results/${geneId}`,
      { gene },
    );
    return data;
  }
}

export default TargetedGenesService;
