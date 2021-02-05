import { $http } from 'ngimport';

class ProbeTargetService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Retrieve all Probe Targets for this POG
   * @param {String} report - report ident
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(report) {
    const resp = await $http.get(
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
    const resp = await $http.get(
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
    const resp = await $http.put(
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
    const resp = await $http.delete(
      `${this.api}/${report}/probe-results/${ident}`,
    );
    return resp.data;
  }
}

export default new ProbeTargetService();
