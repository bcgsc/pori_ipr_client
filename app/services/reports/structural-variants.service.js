import { $http } from 'ngimport';

class StructuralVariantsService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Get all structural variants
   * @param {String} report - report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/structural-variants`,
    );
    return data;
  }

  /**
   * Update a single structural variant entry
   * @param {String} report - report ID
   * @param {String} ident - ident String
   * @param {Object} payload - Object to be updated
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async updateOne(report, ident, payload) {
    const { data } = await $http.put(
      `${this.api}/${report}/structural-variants/${ident}`,
      payload,
    );
    return data;
  }

  /**
   * Get structural variants by specific type
   * @param {String} report - report ID
   * @param {String} type - type as String
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async getType(report, type) {
    const { data } = await $http.get(
      `${this.api}/${report}/structural-variants/${type}`,
    );
    return data;
  }
}

export default new StructuralVariantsService();
