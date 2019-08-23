class GenomicAterationsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Retrieve all POGs from API that user can access
   * @param {String} pogID - pogID as String
   * @param {String} report - report ident
   * @return {Promise} API response
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(pogID, report) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/genomicAlterationsIdentified`,
    );
    return resp.data;
  }
  
  /**
   * Get an Identified Genomic Alteration
   * @param {String} pogID - pogID as String
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(pogID, report, ident) {
    const resp = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/genomicAlterationsIdentified/${ident}`,
    );
    return resp.data;
  }
  
  /**
   * Update an Identified Genomic Alteration
   * @param {String} pogID - pogID, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @param {*} gai - Genomic Alterations Identified
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pogID, report, ident, gai) {
    const resp = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/genomicAlterationsIdentified/${ident}`,
      gai,
    );
    return resp.data;
  }

  /**
   * Create an Identified Genomic Alteration
   * @param {String} pogID - pogID, eg POG129
   * @param {String} report - report ident
   * @param {*} alteration - alteration
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async create(pogID, report, alteration) {
    const resp = await this.$http.post(
      `${this.api}/${pogID}/report/${report}/genomic/summary/genomicAlterationsIdentified/`,
      alteration,
    );
    return resp.data;
  }
  
  /**
   * Remove an Identified Genomic Alteration
   * @param {String} pogID - pogID, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @param {String} comment - comment
   * @param {Boolean} cascade - cascade
   * @return {Promise} API respoinse
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(pogID, report, ident, comment, cascade = false) {
    await this.$http.delete(
      `${this.api}/${pogID}/report/${report}/genomic/summary/genomicAlterationsIdentified/${ident}`,
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
