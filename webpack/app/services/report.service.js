class ReportService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = CONFIG['jdavies-local'].ENDPOINTS.API;
  }

  /**
   * Retrieve all report from API that user can access with options
   * @param {Object} params - Object with params
   * @return {Promise} Resolves with array of reports
   * @throws {ErrorType} Thrown when API call fails
   */
  async allFiltered(params = {}) {
    const opts = { params };
    const resp = await this.$http.get(`${this.api}/reports`, opts);
    return resp.data;
  } // TODO: Differenciate between this member and getAllReports (was $report.all())

  /**
   * Retrieve one report from API.
   * @param {String} report - The report ident string (4 chars)
   * @return {Promise} Report details
   * @throws {ErrorType} Thrown when API call fails
   */
  async getReport(report) {
    const resp = await this.$http.get(`${this.api}/reports/${report}`);
    return resp.data;
  } // TODO: Differenciate between this member and getPogReport (was $report.get())

  /**
   * Update a report entry
   * @param {Object} report - Report object to be updated
   * @returns {Promise} Result of update report API call
   * @throws {ErrorType} Thrown when API call fails
   */
  async updateReport(report) {
    const resp = await this.$http.put(`${this.api}/reports/${report.ident}`, report);
    return resp.data;
  }

  /**
   * Bind a user to a report
   * @param {String} report - Report Ident
   * @param {String} user - User Ident (or username)
   * @param {String} role - role name
   * @return {Promise} Bind user API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async bindUser(report, user, role) {
    const resp = await this.$http.post(`${this.api}/reports/${report}/user`, { user, role });
    return resp.data;
  }

  /**
   * Unbind a user from a report
   * @param {String} report - Report Ident
   * @param {String} user - User Ident (or username)
   * @param {String} role - role name
   * @return {Promise} Bind user API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async unbindUser(report, user, role) {
    const resp = await this.$http.delete(`${this.api}/reports/${report}/user`, { user, role });
    return resp.data;
  }

  /**
   * Retrieve all report from API that user can access
   * @param {String} pog - POGID
   * @param {Object} params - Object with params
   * @return {Promise} Resolves with array of reports
   * @throws {ErrorType} Thrown when API call fails
   */
  async getAllReports(pog, params = {}) {
    const resp = await this.$http.get(`${this.api}/POG/${pog}/reports`, { params });
    return resp.data;
  } // TODO: Differenciate between this member and allFiltered (was $report.pog().all())

  /**
   * Retrieve one report from the API
   * @param {String} report - The report ident string (4 chars)
   * @return {Promise} Report object
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    const resp = await this.$http.get(`${this.api}/POG/${pog}/reports/${report}`);
    return resp.data;
  } // TODO: Differenciate between this member and getReport (was $report.pog().get())
}

export default ReportService;
