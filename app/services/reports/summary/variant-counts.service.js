class VariantCountsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
 
  /**
   * Get Variant Counts
   * @param {String} pogID - PogID of requested resource, eg. POG129
   * @param {String} report - report ident
   * @return {Promise} API reponse as promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID, report) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/variantCounts`,
    );
    return resp.data;
  }
  

  /**
   * Update Variant Counts
   * @param {String} pogID - pogID, eg POG129
   * @param {String} report - report ident
   * @param {Object} analysis - analysis object
   * @return {Promise} API response as promise
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pogID, report, analysis) {
    const resp = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/variantCounts/`,
      analysis,
    );
    return resp.data;
  }
}

export default VariantCountsService;
