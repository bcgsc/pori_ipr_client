class ProbeTargetService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieve all Probe Targets for this POG
   * @param {String} report - report ident
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(report) {
    const resp = await this.$http.get(
      `${this.api}/${report}/probe-results`,
    );
    return resp.data;
  }

  /**
   * Get a Probe Target
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(report, ident) {
    const resp = await this.$http.get(
      `${this.api}/${report}/probe-results/${ident}`,
    );
    return resp.data;
  }

  /**
   * Update a Probe Target
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @param {*} gai - Genomic Alterations Identified
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(report, ident, gai) {
    const resp = await this.$http.put(
      `${this.api}/${report}/probe-results/${ident}`,
      gai,
    );
    return resp.data;
  }

  /**
   * Remove a Probe Target
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(report, ident) {
    const resp = await this.$http.delete(
      `${this.api}/${report}/probe-results/${ident}`,
    );
    return resp.data;
  }
}

export default ProbeTargetService;
