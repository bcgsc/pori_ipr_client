class StructuralVariantsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get all structural variants
   * @param {String} patient - patient ID
   * @param {String} report - report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/structuralVariation/sv`,
    );
    return data;
  }
  
  /**
   * Update a single structural variant entry
   * @param {String} patient - patient ID
   * @param {String} report - report ID
   * @param {String} ident - ident String
   * @param {Object} payload - Object to be updated
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async updateOne(patient, report, ident, payload) {
    const { data } = await this.$http.put(
      `${this.api}/${patient}/report/${report}/genomic/structuralVariation/sv/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get structural variants by specific type
   * @param {String} patient - patient ID
   * @param {String} report - report ID
   * @param {String} type - type as String
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async getType(patient, report, type) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/structuralVariation/sv/${type}`,
    );
    return data;
  }
}

export default StructuralVariantsService;
