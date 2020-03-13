class SmallMutationsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get all small mutations
   * @param {String} report - report ident
   * @return {Promise} API response data
   */
  async all(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/somatic-mutations/small-mutations`,
    );
    return data;
  }

  /**
   * Update mutations
   * @param {String} report - report ident
   * @param {String} ident - UUID ident
   * @param {*} payload - Update data
   * @return {Promise} API response data
   */
  async update(report, ident, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/somatic-mutations/small-mutations/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get alterations by specific type
   * @param {String} report - report ident
   * @param {String} type - type to retrieve
   * @return {Promise} API response data
   */
  async getType(report, type) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/somatic-mutations/small-mutations/${type}`,
    );
    return data;
  }
}

export default SmallMutationsService;
