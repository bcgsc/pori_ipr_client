class OutlierService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get all outliers
   * @param {String} patient - patient ID as String
   * @param {String} report - report ident
   * @return {Promise} - API response data
*/
  async all(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/expressionAnalysis/outlier`,
    );
    return data;
  }

  /**
   * Update a single case
   * @param {String} patient - patient ID as String
   * @param {String} report - report ident
   * @param {String} ident - outlier ID
   * @param {Object} payload - object to update existing
   * @return {Promise} - API response data
   */
  async updateOne(patient, report, ident, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${patient}/report/${report}/genomic/expressionAnalysis/outlier/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get the outlier type
   * @param {String} patient - patient ID as String
   * @param {String} report - report ident
   * @param {String} type - type
   * @return {Promise} - API response data
   */
  async getType(patient, report, type) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/expressionAnalysis/outlier/${type}`,
    );
    return data;
  }
}

export default OutlierService;
