class MutationSummary {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Get Genomic Events with Therapeutic Association
   * @param {String} POGID - POGID as String
   * @param {Object} report - report object
   * @return {Promise} API response value
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(POGID, report) {
    const resp = await this.$http.get(`${this.api}/${POGID}/report/${report}/genomic/summary/mutationSummary`);
    return resp.data;
  }
  
  /**
   * Update an Genomic Event with Therapeutic Association
   * @param {String} POGID - POGID as string
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response value
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(POGID, report, summary) {
    const resp = await this.$http.put(api + '/' + POGID + '/report/' + report + '/genomic/summary/mutationSummary/', summary);
    return resp.data;
  }
}

export default MutationSummary;
