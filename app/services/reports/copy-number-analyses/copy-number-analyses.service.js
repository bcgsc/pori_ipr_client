class CopyNumberAnalyses {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get all copy number analyses for a given report
   * @param {String} patient - patient as String eg: POG103
   * @param {String} report - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/copyNumberAnalyses/cnv`,
    );
    return data;
  }

  /**
   * Update a single copy number analysis
   * @param {String} patient - patient as String eg: POG103
   * @param {String} report - report ident
   * @param {String} ident - ident String
   * @param {Object} payload - payload object to be updated
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async updateOne(patient, report, ident, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${patient}/report/${report}/genomic/copyNumberAnalyses/cnv/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get alterations by specific type
   * @param {String} patient - patient as String eg: POG103
   * @param {String} report - report ident
   * @param {String} type - type of alteration
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async getType(patient, report, type) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/copyNumberAnalyses/cnv/${type}`,
    );
    return data;
  }
}

export default CopyNumberAnalyses;
