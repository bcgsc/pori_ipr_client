/**
 * Pog service for API calls
 */
class PogService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
    this.pogs = [];
  }
  
  /**
   * Retrieve all POGs from API that user can access
   * @param {Object} opts - Options block
   * @return {Promise} - Resolves with array of POGs
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(opts = {}) {
    const resp = await this.$http.get(this.api, { params: opts });
    this.pogs = resp.data;
    return this.pogs;
  }
  
  /**
   * Retrieve one POG from API.
   * @param {String} pogID - id # of pog
   * @return {Promise} Single pog
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(pogID) {
    // Lookup in cache first
    if (this.pogs[pogID]) {
      return this.pogs[pogID];
    }
    
    const resp = await this.$http.get(`${this.api}/${pogID}`);
    this.pogs[resp.data.POGID] = resp.data;
    return this.pogs[resp.data.POGID];
  }

  /**
   * Update pog
   * @param {Object} pog - pog object
   * @return {Promise} Update response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pog) {
    const resp = await this.$http.put(`${this.api}/${pog.POGID}`, pog);
    return resp.data;
  }

  /**
   * Empty cache
   * @return {null} null
   */
  async destroy() {
    this.pogs = {};
  }
}

export default PogService;
