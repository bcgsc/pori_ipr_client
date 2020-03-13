class GenomicEventsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get Genomic Events with Therapeutic Association for a given patient ID
   * @param {String} reportId - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(reportId) {
    const resp = await this.$http.get(
      `${this.api}/${reportId}/summary/genomic-events-therapeutic`,
    );
    return resp.data;
  }

  /**
   * Get a Genomic Event with Therapeutic Association
   * @param {String} reportId - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API reponse data
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(reportId, ident) {
    const resp = await this.$http.get(
      `${this.api}/${reportId}/summary/genomic-events-therapeutic/${ident}`,
    );
    return resp.data;
  }

  /**
   * Update a Genomic Event with Therapeutic Association
   * @param {String} reportId - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @param {*} get - Genomic Events
   * @return {promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(reportId, ident, get) {
    const resp = await this.$http.put(
      `${this.api}/${reportId}/summary/genomic-events-therapeutic/${ident}`,
      get,
    );
    return resp.data;
  }

  /**
   * Remove a Genomic Event with Therapeutic Association
   * @param {String} reportId - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(reportId, ident) {
    const resp = await this.$http.delete(
      `${this.api}/${reportId}/summary/genomic-events-therapeutic/${ident}`,
    );
    return resp.data;
  }
}

export default GenomicEventsService;
