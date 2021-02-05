import { $http } from 'ngimport';

class MavisService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Get all Mavis results
   * @param {String} report - report ID
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/mavis`,
    );
    return data;
  }
}

export default new MavisService();
