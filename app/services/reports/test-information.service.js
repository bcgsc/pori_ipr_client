import { $http } from 'ngimport';

class ProbeTestInformationService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Retrieve test information for a report
   *
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async retrieve(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/probe-test-information`,
    );
    return data;
  }
}

export default new ProbeTestInformationService();
