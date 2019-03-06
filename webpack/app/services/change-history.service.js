class ChangeHistoryService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get all change history events for a patient
   *
   * @param {String} pogID - patient identifier to get info for * @param {String} report - report ident to get info for
   *
   * @returns {Promise} - list of all change history events for the specified patient/report combo
   */
  async getChangeHistory(pogID, report) {
    const resp = await this.$http.get(`${this.api}/${pogID}/report/${report}/history`);
    return resp.data;
  }

  /**
   * Get detailed info about a specified change history event
   *
   * @param {String} pogID - patient identifier to get info for
   * @param {String} report - report ident to get info for
   * @param {String} ident - UUID of change history event to get info for
   *
   * @returns {Promise} - hashmap of detailed change history event data
   */
  async getChangeHistoryDetails(pogID, report, ident) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/history/detail/${ident}`,
    );
    return resp.data;
  }

  /**
   * Revert a change history event
   *
   * @param {String} pogID - patient identifier to get info for
   * @param {String} report - report ident to get info for
   * @param {String} ident - UUID of change history event being reverted
   * @param {String} comment - reason for reverting change history event
   *
   * @returns {Promise} - new change history object
   */
  async revertChangeHistory(pogID, report, ident, comment) {
    const resp = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/history/revert/${ident}`,
      { comment },
    );
    return resp.data;
  }

  /**
   * Restores a change history deletion event
   *
   * @param {String} pogID - patient identifier to get info for
   * @param {String} report - report ident to get info for
   * @param {String} ident - UUID of change history event being restored
   * @param {String} comment - reason for restoring change history event
   *
   * @returns {Promise} - result of API call
   */
  async restoreChangeHistory(pogID, report, ident, comment) {
    const resp = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/history/restore/${ident}`,
      { comment },
    );
    return resp.data;
  }

  /**
   * Get all change history tags for a patient
   *
   * @param {String} pogID - patient identifier to get tags for
   * @param {String} report - report ident to get tags for
   *
   * @returns {Promise} - array of change history tags
   */
  async getChangeHistoryTags(pogID, report) {
    const resp = await this.$http.get(`${this.api}/${pogID}/report/${report}/history/tag`);
    return resp.data;
  }

  /**
   * Create new change history tag for a patient
   *
   * @param {String} pogID - patient identifier to create tag for
   * @param {String} report - report ident to create tag for
   * @param {Object} tag - name of tag
   * @param {String} ident - optional change history UUID string
   *
   * @returns {Promise} - new tag object
   */
  async createChangeHistoryTag(pogID, report, tag, ident = '') {
    const resp = await this.$http.post(
      `${this.api}/${pogID}/report/${report}/history/tag/${ident}`,
      tag,
    );
    return resp.data;
  }

  /**
   * Remove a change history tag for a patient
   *
   * @param {String} pogID - patient identifier to remove tag from
   * @param {String} report - report ident to remove tag from
   * @param {String} ident - change history tag UUID string to remove
   *
   * @returns {Promise} - result of API call
   */
  async removeChangeHistoryTag(pogID, report, ident) {
    const resp = await this.$http.delete(
      `${this.api}/${pogID}/report/${report}/history/tag/${ident}`,
    );
    return resp.data;
  }

  /**
   * Search for tags for a specified patient
   *
   * @param {String} pogID - patient identifier to find tags for
   * @param {String} report - report ident to find tags for
   * @param {String} query - tag name to search for
   *
   * @returns {Promise} - array of matching change history tags
   */
  async searchChangeHistoryTags(pogID, report, query) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/history/tag/search/${query}`,
    );
    return resp.data;
  }
}
  
export default ChangeHistoryService;
