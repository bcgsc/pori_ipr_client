class TherapeuticOptionsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get all therapeutic targets
   * @param {String} pogID - POGID this entry will be related to
   * @param {String} report - report ident
   * @return {Promise} - Resolves with the new data entry
   */
  async all(pogID, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/therapeuticTargets`,
    );
    return data;
  }

  /**
   * Create a new Therapeutic Target Entry
   *
   * @param {String} pogID - POGID this entry will be related to
   * @param {String} report - report ident
   * @param {Object} entry - The therapeutic target entry to be created
   * @return {Promise} - Resolves with the new data entry
   */
  async create(pogID, report, entry) {
    const { data } = await this.$http.post(
      `${this.api}/${pogID}/report/${report}/genomic/therapeuticTargets`,
      entry,
    );
    return data;
  }

  /**
   * Retrieve therapeutic target entry
   * @param {String} pogID - PogID to be queried against (eg. POG123)
   * @param {String} report - report ident
   * @param {String} ident - UUID of entry
   * @returns {Promise} - Resolves with object of entry
   */
  async retrieve(pogID, report, ident) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/therapeuticTargets/${ident}`,
    );
    return data;
  }

  /**
   * Update a single therapeutic target entry
   *
   * @param {String} pogID - PogID to be queried against (eg. POG123)
   * @param {String} report - report ident
   * @param {String} ident - UUID of entry
   * @param {Object} entry - Object of entry to be created
   * @returns {Promise} - Resolves with object of entry
   */
  async update(pogID, report, ident, entry) {
    const { data } = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/therapeuticTargets/${ident}`,
      entry,
    );
    return data;
  }

  /**
   * Remove therapeutic target entry
   *
   * @param {String} pogID - PogID to be queried against (eg. POG123)
   * @param {String} report - report ident
   * @param {String} ident - UUID of entry
   * @returns {Promise} - Resolves with object of entry
   */
  async remove(pogID, report, ident) {
    const { data } = await this.$http.delete(
      `${this.api}/${pogID}/report/${report}/genomic/therapeuticTargets/${ident}`,
    );
    return data;
  }
}

export default TherapeuticOptionsService;
