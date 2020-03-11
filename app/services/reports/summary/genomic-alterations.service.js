class GenomicAterationsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieve all genomic alterations from a report that a user can access
   * @param {String} reportId - report ident
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(reportId) {
    const resp = await this.$http.get(
      `${this.api}/${reportId}/summary/genomic-alterations-identified`,
    );
    return resp.data;
  }

  /**
   * Get an Identified Genomic Alteration
   * @param {String} reportId - report ident
   * @param {String} ident - genomic alterations UUID
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(reportId, ident) {
    const resp = await this.$http.get(
      `${this.api}/${reportId}/summary/genomic-alterations-identified/${ident}`,
    );
    return resp.data;
  }

  /**
   * Update an Identified Genomic Alteration
   * @param {String} reportId - report ident
   * @param {String} ident - genomic alterations UUID
   * @param {*} gai - Genomic Alterations Identified
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(reportId, ident, gai) {
    const resp = await this.$http.put(
      `${this.api}/${reportId}/summary/genomic-alterations-identified/${ident}`,
      gai,
    );
    return resp.data;
  }

  /**
   * Create an Identified Genomic Alteration
   * @param {String} reportId - report ident
   * @param {*} alteration - alteration
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async create(reportId, alteration) {
    const resp = await this.$http.post(
      `${this.api}/${reportId}/summary/genomic-alterations-identified/`,
      alteration,
    );
    return resp.data;
  }

  /**
   * Remove an Identified Genomic Alteration
   * @param {String} reportId - report ident
   * @param {String} ident - genomic alterations UUID
   * @param {String} comment - comment
   * @param {Boolean} cascade - cascade
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(reportId, ident, comment, cascade = false) {
    await this.$http.delete(
      `${this.api}/${reportId}/summary/genomic-alterations-identified/${ident}`,
      {
        data: {
          comment,
          cascade,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return true;
  }
}

export default GenomicAterationsService;
