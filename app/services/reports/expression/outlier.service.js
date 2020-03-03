class OutlierService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get all outliers
   * @param {String} report - report ident
   * @return {Promise} - API response data
*/
  async all(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/genomic/expression-analysis/outlier`,
    );
    return data;
  }

  /**
   * Update a single case
   * @param {String} report - report ident
   * @param {String} ident - outlier ID
   * @param {Object} payload - object to update existing
   * @return {Promise} - API response data
   */
  async updateOne(report, ident, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/genomic/expression-analysis/outlier/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get the outlier type
   * @param {String} report - report ident
   * @param {String} type - type
   * @return {Promise} - API response data
   */
  async getType(report, type) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/genomic/expression-analysis/outlier/${type}`,
    );
    return data;
  }
}

export default OutlierService;
