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

  async update(report, eventId, comments) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/probe-results/${eventId}`,
      comments,
    );
    return data;
  }
}

export default TargetedGenesService;
