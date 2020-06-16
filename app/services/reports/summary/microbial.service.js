import { $http } from 'ngimport';

class MicrobialService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get Microbial Content
   * @param {String} report - Report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/summary/microbial`,
    );
    return data;
  }
}

export default new MicrobialService();
