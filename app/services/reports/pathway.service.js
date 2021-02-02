import { $http } from 'ngimport';

class PathwayAnalysisService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Retrieves pathway analysis for report
   * @param {String} report - report ident
   * @returns {Promise} - result of API call
   */
  async get(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/summary/pathway-analysis`,
    );
    return data;
  }

  /**
   * Updates pathway analysis for report
   * @param {String} report - report ident
   * @param {Object} summary - object payload
   *
   * @returns {Promise} - result of API call
   */
  async update(report, summary) {
    const { data } = await $http.put(
      `${this.api}/${report}/summary/pathway-analysis`,
      summary,
    );
    return data;
  }
}

export default new PathwayAnalysisService();
