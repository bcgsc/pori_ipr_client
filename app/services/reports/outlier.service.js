import { $http } from 'ngimport';

class OutlierService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get all outliers
   * @param {String} report - report ident
   * @return {Promise} - API response data
*/
  async all(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/expression-variants`,
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
    const { data } = await $http.put(
      `${this.api}/${report}/expression-variants/${ident}`,
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
    const { data } = await $http.get(
      `${this.api}/${report}/expression-variants/${type}`,
    );
    return data;
  }
}

export default new OutlierService();
