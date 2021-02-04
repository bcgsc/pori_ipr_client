import { $http } from 'ngimport';

class SlidesService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Get all presentation slides for this report
   * @param {string} report - Report Ident
   * @returns {Promise} - resolves with all slides
   */
  async all(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/presentation/slide`,
    );
    return data;
  }

  /**
   * Get a presentation slide
   *
   * @param {string} report - Report Ident
   * @param {string} ident - Slide ident string
   *
   * @returns {Promise} - resolves with all slides
   */
  async get(report, ident) {
    const { data } = await $http.get(
      `${this.api}/${report}/presentation/slide/${ident}`,
    );
    return data;
  }

  /**
   * Remove presentation slide
   *
   * @param {string} report - Report Ident
   * @param {string} ident - Slide ident string
   *
   * @returns {Promise} - resolves with all slides
   */
  async remove(report, ident) {
    const { data } = await $http.delete(
      `${this.api}/${report}/presentation/slide/${ident}`,
    );
    return data;
  }
}

export default new SlidesService();
