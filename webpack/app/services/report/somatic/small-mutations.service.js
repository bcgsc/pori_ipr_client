class SmallMutationsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get all small mutations
   * @param {String} pog - pog as a String ex: POG123
   * @param {String} report - report ident
   * @return {Promise} API response data
   */
  async all(pog, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pog}/report/${report}/genomic/somaticMutations/smallMutations`,
    );
    return data;
  }

  /**
   * Update mutations
   * @param {String} pog - pog as a String ex: POG123
   * @param {String} report - report ident
   * @param {String} ident - UUID ident
   * @param {*} payload - Update data
   * @return {Promise} API response data
   */
  async update(pog, report, ident, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${pog}/report/${report}/genomic/somaticMutations/smallMutations/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get alterations by specific type
   * @param {String} pog - pog as a String ex: POG123
   * @param {String} report - report ident
   * @param {String} type - type to retrieve
   * @return {Promise} API response data
   */
  async getType(pog, report, type) {
    const { data } = await this.$http.get(
      `${this.api}/${pog}/report/${report}/genomic/somaticMutations/smallMutations/${type}`,
    );
    return data;
  }
}

export default SmallMutationsService;
