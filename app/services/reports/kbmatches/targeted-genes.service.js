class TargetedGenesService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  async getAll(pog, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pog}/report/${report}/genomic/detailedGenomicAnalysis/targetedGenes`,
    );
    return data;
  }
}

export default TargetedGenesService;
