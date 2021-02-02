import { $http } from 'ngimport';

class AnalystCommentsService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Retrieve anaylist comments for this report
   * @param {String} report - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report) {
    const { data } = await $http.get(
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
    const { data } = await $http.put(
      `${this.api}/${report}/summary/analyst-comments`, summary,
    );
    return data;
  }

  /**
   * Sign Analyst Comments
   *
   * @param {String} report - Report unique identifier
   * @param {String} role - The role to sign for
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async sign(report, role) {
    const { data } = await $http.put(
      `${this.api}/${report}/summary/analyst-comments/sign/${role}`, {},
    );
    return data;
  }

  /**
   * Revoke Analyst Comments Signature
   * @param {String} report - Report unique identifier
   * @param {String} role - The role to sign for
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async revokeSign(report, role) {
    const { data } = await $http.put(
      `${this.api}/${report}/summary/analyst-comments/sign/revoke/${role}`,
      {},
    );
    return data;
  }
}

export default new AnalystCommentsService();
