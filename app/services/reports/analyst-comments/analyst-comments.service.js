class AnalystCommentsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Retrieve anaylist comments for this POG
   * @param {String} pogID - pogID as String eg: POG103
   * @param {String} report - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/analystComments`,
    );
    return data;
  }
  
  /**
   * Update an Analyst comment
   * @param {String} pogID - pogID as String eg: POG103
   * @param {String} report - report ident
   * @param {String} summary - Text body of summary
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pogID, report, summary) {
    const { data } = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/analystComments`, summary,
    );
    return data;
  }

  /**
   * Sign Analyst Comments
   *
   * @param {String} pogID - pogID as String eg: POG103
   * @param {String} report - Report unique identifier
   * @param {String} role - The role to sign for
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async sign(pogID, report, role) {
    const { data } = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/analystComments/sign/${role}`, {},
    );
    return data;
  }

  /**
   * Revoke Analyst Comments Signature
   * @param {String} pogID - pogID as String eg: POG103
   * @param {String} report - Report unique identifier
   * @param {String} role - The role to sign for
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async revokeSign(pogID, report, role) {
    const { data } = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/analystComments/sign/revoke/${role}`,
      {},
    );
    return data;
  }
}

export default AnalystCommentsService;
