class ProbeAlterationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Retrieve all probe alterations for report
   *
   * @param {String} pog - patient identifier
   * @param {String} report - report ident
   *
   * @returns {Promise} - result of API call
   */
  async getAll(pog, report) {
    const { data } = await this.$http.get(`${this.api}/${pog}/report/${report}/probe/alterations`);
    return data;
  }

  /**
   * Update probe alteration for report
   *
   * @param {String} pog - patient identifier
   * @param {String} report - report ident
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async update(pog, report, ident, payload) {
    const { data } = await this.$http.put(`${this.api}/${pog}/report/${report}/probe/alterations/${ident}`, payload);
    return data;
  }

  /**
   * Create new probe alteration for report
   *
   * @param {String} pog - patient identifier
   * @param {String} report - report ident
   * @param {String} ident - alteration uuid
   * @param {Object} payload - alteration object payload
   *
   * @returns {Promise} - result of API call
   */
  async create(pog, report, ident, payload) {
    const { data } = await this.$http.post(`${this.api}/${pog}/report/${report}/probe/alterations/${ident}`, payload);
    return data;
  }
  
  /**
   * Retrieve all probe alterations for report by type
   *
   * @param {String} pog - patient identifier
   * @param {String} report - report ident
   * @param {String} type - alteration type
   *
   * @returns {Promise} - result of API call
   */
  async getType(pog, report, type) {
    const { data } = await this.$http.get(`${this.api}/${pog}/report/${report}/probe/alterations/${type}`);
    return data;
  }
}
  
export default ProbeAlterationService;
