class DiscussionService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get All Discussion notes
   *
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   *
   * @returns {Promise} - Resolves with all entries
   */
  async all(patient, report) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/presentation/discussion`,
    );
    return data;
  }

  /**
   * Create new discussion entry
   *
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   * @param {object} entry - New entry data object
   *
   * @returns {Promise} - Resolves with new entry
   */
  async create(patient, report, entry) {
    const { data } = await this.$http.post(
      `${this.api}/${patient}/report/${report}/genomic/presentation/discussion`, entry,
    );
    return data;
  }

  /**
   * Get a discussion entry
   *
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   * @param {string} ident - Report ident string
   *
   * @returns {Promise} - Resolves with updated entry
   */
  async get(patient, report, ident) {
    const { data } = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/presentation/discussion/${ident}`,
    );
    return data;
  }

  /**
   * Update an existing discussion entry
   *
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   * @param {string} ident - Report ident string
   * @param {object} entry - data object of entry
   *
   * @returns {Promise} - Resolves with updated entry
   */
  async update(patient, report, ident, entry) {
    const { data } = await this.$http.put(
      `${this.api}/${patient}/report/${report}/genomic/presentation/discussion/${ident}`, entry,
    );
    return data;
  }

  /**
   * Remove an existing discussion entry
   *
   * @param {string} patient - Patient ID
   * @param {string} report - Report Ident
   * @param {string} ident - Report ident string
   *
   * @returns {Promise} - Resolves with updated entry
   */
  async remove(patient, report, ident) {
    const { data } = await this.$http.delete(
      `${this.api}/${patient}/report/${report}/genomic/presentation/discussion/${ident}`,
    );
    return data;
  }
}

export default DiscussionService;
