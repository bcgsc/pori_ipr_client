class ReportService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = CONFIG.ENDPOINTS.API;
  }

  /**
   * Retrieve all report from API that user can access with options
   * @param {Object} params - Object with params
   * @return {Promise} Resolves with array of reports
   * @throws {ErrorType} Thrown when API call fails
   */
  async allFiltered(params = {}) {
    const opts = { params };
    const { data } = await this.$http.get(`${this.api}/reports`, opts);
    return data;
  } // TODO: Differenciate between this member and getAllReports (was $report.all())

  /**
   * Retrieve one report from API.
   * @param {String} report - The report ident string (4 chars)
   * @return {Promise} Report details
   * @throws {ErrorType} Thrown when API call fails
   */
  async getReport(report) {
    const { data } = await this.$http.get(`${this.api}/reports/${report}`);
    return data;
  } // TODO: Differenciate between this member and getPogReport (was $report.get())

  /**
   * Update a report entry
   * @param {String} report - Report ident
   * @returns {Promise} Result of update report API call
   * @throws {ErrorType} Thrown when API call fails
   */
  async updateReport(report) {
    const { data } = await this.$http.put(`${this.api}/reports/${report.ident}`, report);
    return data;
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
    const { data } = await this.$http.post(`${this.api}/reports/${report}/user`, { user, role });
    return data;
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
    const { data } = await this.$http.delete(`${this.api}/reports/${report}/user`,
      {
        data: {
          user, role,
        },
        headers: {
          'Content-type': 'application/json',
        },
      });
    return data;
  }

  /**
   * Retrieve all report from API that user can access
   * @param {String} pogID - pogID as String
   * @param {Object} params - Object with params
   * @return {Promise} Resolves with array of reports
   * @throws {ErrorType} Thrown when API call fails
   */
  async getAllReports(pogID, params = {}) {
    const { data } = await this.$http.get(`${this.api}/POG/${pogID}/reports`, { params });
    return data;
  } // TODO: Differenciate between this member and allFiltered (was $report.pog().all())

  /**
   * Retrieve one report from the API
   * @param {String} pogID - pogID as String
   * @param {String} report - The report ident string (4 chars)
   * @return {Promise} Report object
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID, report) {
    const { data } = await this.$http.get(`${this.api}/POG/${pogID}/reports/${report}`);
    return data;
  } // TODO: Differenciate between this member and getReport (was $report.pog().get())
}

export default ReportService;
