class ReportService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieve all report from API that user can access with options
   * @param {Object} params - Object with params
   * @return {Promise} Resolves with array of reports
   * @throws {ErrorType} Thrown when API call fails
   */
  async allFiltered(params = {}) {
    const opts = { params };
    const { data } = await this.$http.get(`${this.api}`, opts);
    return data;
  } // TODO: Differenciate between this member and getAllReports (was $report.all())

  /**
   * Retrieve one report from API.
   * @param {String} report - The report ident string (5 chars)
   * @return {Promise} Report details
   * @throws {ErrorType} Thrown when API call fails
   */
  async getReport(report) {
    const { data } = await this.$http.get(`${this.api}/${report}`);
    return data;
  } // TODO: Differenciate between this member and getPogReport (was $report.get())

  /**
   * Update a report entry
   * @param {String} report - Report object
   * @returns {Promise} Result of update report API call
   * @throws {ErrorType} Thrown when API call fails
   */
  async updateReport(report) {
    const { data } = await this.$http.put(`${this.api}/${report.ident}`, report);
    return data;
  }

  /**
   * Delete a report entry (note: this endpoint does not return data if successful)
   * @param {Object} report - Report object
   * @returns {Promise} Result of delete report API call
   * @throws {ErrorType} Thrown when API call fails
   */
  async deleteReport(report) {
    return this.$http.delete(`${this.api}/${report.ident}`, report);
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
}

export default ReportService;
