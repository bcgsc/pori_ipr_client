class SlidesService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get all presentation slides for this report
   * @param {string} report - Report Ident
   * @returns {Promise} - resolves with all slides
   */
  async all(report) {
    const { data } = await this.$http.get(
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
    const { data } = await this.$http.get(
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
    const { data } = await this.$http.delete(
      `${this.api}/${report}/presentation/slide/${ident}`,
    );
    return data;
  }
}

export default SlidesService;
