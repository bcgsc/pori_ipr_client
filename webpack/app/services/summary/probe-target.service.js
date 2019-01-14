class ProbeTargetService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieve all Probe Targets for this POG
   * @param {String} pogID - POGID associated with these resource
   * @param {String} report - report ident
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(pogID, report) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/probeTarget`,
    );
    return resp.data;
  }
  
  /**
   * Get a Probe Target
   * @param {String} pogID - POGID, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(pogID, report, ident) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/probeTarget/${ident}`,
    );
    return resp.data;
  }
  
  /**
   * Update a Probe Target
   * @param {String} pogID - POGID, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @param {*} gai - Genomic Alterations Identified
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pogID, report, ident, gai) {
    const resp = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/probeTarget/${ident}`,
      gai,
    );
    return resp.data;
  }
  
  /**
   * Remove a Probe Target
   * @param {String} pogID - POGID, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(pogID, report, ident) {
    const resp = await this.$http.delete(
      `${this.api}/${pogID}/report/${report}/genomic/summary/probeTarget/${ident}`,
    );
    return resp.data;
  }
}

export default ProbeTargetService;
