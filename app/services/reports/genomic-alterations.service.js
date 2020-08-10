import { $http } from 'ngimport';

class GenomicAterationsService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Retrieve all genomic alterations from a report that a user can access
   * @param {String} reportIdent - report ident
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(reportIdent) {
    const resp = await $http.get(
      `${this.api}/${reportIdent}/summary/genomic-alterations-identified`,
    );
    return resp.data;
  }

  /**
   * Get an Identified Genomic Alteration
   * @param {String} reportIdent - report ident
   * @param {String} ident - genomic alterations UUID
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(reportIdent, ident) {
    const resp = await $http.get(
      `${this.api}/${reportIdent}/summary/genomic-alterations-identified/${ident}`,
    );
    return resp.data;
  }

  /**
   * Update an Identified Genomic Alteration
   * @param {String} reportIdent - report ident
   * @param {String} ident - genomic alterations UUID
   * @param {*} gai - Genomic Alterations Identified
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(reportIdent, ident, gai) {
    const resp = await $http.put(
      `${this.api}/${reportIdent}/summary/genomic-alterations-identified/${ident}`,
      gai,
    );
    return resp.data;
  }

  /**
   * Create an Identified Genomic Alteration
   * @param {String} reportIdent - report ident
   * @param {*} alteration - alteration
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async create(reportIdent, alteration) {
    const resp = await $http.post(
      `${this.api}/${reportIdent}/summary/genomic-alterations-identified/`,
      alteration,
    );
    return resp.data;
  }

  /**
   * Remove an Identified Genomic Alteration
   * @param {String} reportIdent - report ident
   * @param {String} ident - genomic alterations UUID
   * @param {String} comment - comment
   * @param {Boolean} cascade - cascade
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(reportIdent, ident, comment) {
    await this.$http.delete(
      `${this.api}/${reportIdent}/summary/genomic-alterations-identified/${ident}`,
      {
        data: {
          comment,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return true;
  }
}

export default new GenomicAterationsService();
