class VariantCountsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
 
  /**
   * Get Variant Counts
   * @param {String} POGID - PogID of requested resource, eg. POG129
   * @param {Object} report - report object
   * @return {Promise} API reponse as promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(POGID, report) {
    const resp = await this.$http.get(
      `${this.api}/${POGID}/report/${report}/genomic/summary/variantCounts`,
    );
    return resp.data;
  }
  

  /**
   * Update Variant Counts
   * @param {String} POGID - POGID, eg POG129
   * @param {Object} report - report object
   * @param {Object} analysis - analysis object
   * @return {Promise} API response as promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(POGID, report, analysis) {
    const resp = await this.$http.put(
      `${this.api}/${POGID}/report/${report}/genomic/summary/variantCounts/`,
      analysis
    );
    return resp.data;
  }
}

export default VariantCountsService;
