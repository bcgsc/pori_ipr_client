import { $http } from 'ngimport';

class CopyNumber {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get all copy number analyses for a given report
   * @param {String} report - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/copy-variants`,
    );
    return data;
  }

  /**
   * Update a single copy number analysis
   * @param {String} report - report ident
   * @param {String} ident - ident String
   * @param {Object} payload - payload object to be updated
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async updateOne(report, ident, payload) {
    const { data } = await $http.put(
      `${this.api}/${report}/copy-variants/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get alterations by specific type
   * @param {String} report - report ident
   * @param {String} type - type of alteration
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async getType(report, type) {
    const { data } = await $http.get(
      `${this.api}/${report}/copy-variants/${type}`,
    );
    return data;
  }
}

export default new CopyNumber();
