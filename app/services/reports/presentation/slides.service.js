class SlidesService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Get all presentation slides for this report
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   * @returns {Promise} - resolves with all slides
   */
  async all(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/presentation/slide`,
    );
    return data;
  }
    
  /**
   * Get a presentation slide
   *
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   * @param {string} ident - Slide ident string
   *
   * @returns {Promise} - resolves with all slides
   */
  async get(patient, report, ident) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/presentation/slide/${ident}`,
    );
    return data;
  }
  
  /**
   * Remove presentation slide
   *
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   * @param {string} ident - Slide ident string
   *
   * @returns {Promise} - resolves with all slides
   */
  async remove(patient, report, ident) {
    const { data } = await this.$http.delete(
      `${this.api}/${patient}/report/${report}/genomic/presentation/slide/${ident}`,
    );
    return data;
  }
}

export default SlidesService;
