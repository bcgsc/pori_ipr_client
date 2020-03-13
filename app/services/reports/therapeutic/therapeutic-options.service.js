class TherapeuticOptionsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get all therapeutic targets
   * @param {String} report - report ident
   * @return {Promise} - Resolves with the new data entry
   */
  async all(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/therapeutic-targets`,
    );
    return data;
  }

  /**
   * Create a new Therapeutic Target Entry
   * @param {String} report - report ident
   * @param {Object} entry - The therapeutic target entry to be created
   * @return {Promise} - Resolves with the new data entry
   */
  async create(report, entry) {
    const { data } = await this.$http.post(
      `${this.api}/${report}/therapeutic-targets`,
      entry,
    );
    return data;
  }

  /**
   * Retrieve therapeutic target entry
   * @param {String} report - report ident
   * @param {String} ident - UUID of entry
   * @returns {Promise} - Resolves with object of entry
   */
  async retrieve(report, ident) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/therapeutic-targets/${ident}`,
    );
    return data;
  }

  /**
   * Update a single therapeutic target entry
   * @param {String} report - report ident
   * @param {String} ident - UUID of entry
   * @param {Object} entry - Object of entry to be created
   * @returns {Promise} - Resolves with object of entry
   */
  async update(report, ident, entry) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/therapeutic-targets/${ident}`,
      entry,
    );
    return data;
  }

  /**
   * Remove therapeutic target entry
   * @param {String} report - report ident
   * @param {String} ident - UUID of entry
   * @returns {Promise} - Resolves with object of entry
   */
  async remove(report, ident) {
    const { data } = await this.$http.delete(
      `${this.api}/${report}/therapeutic-targets/${ident}`,
    );
    return data;
  }
}

export default TherapeuticOptionsService;
