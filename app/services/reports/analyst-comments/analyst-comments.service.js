class AnalystCommentsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieve anaylist comments for this report
   * @param {String} report - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    const { data } = await this.$http.get(
      `${this.api}/${report}/summary/analyst-comments`,
    );
    return data;
  }

  /**
   * Update an Analyst comment
   * @param {String} report - report ident
   * @param {String} summary - Text body of summary
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(report, summary) {
    const { data } = await this.$http.put(
      `${this.api}/${report}/summary/analyst-comments`, summary,
    );
    return data;
  }
}

export default AnalystCommentsService;
