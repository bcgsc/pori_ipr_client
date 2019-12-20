class GenomicEventsService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Get Genomic Events with Therapeutic Association for a given patient ID
   * @param {String} patient - patient as String
   * @param {String} report - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(patient, report) {
    const resp = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/summary/genomicEventsTherapeutic`,
    );
    return resp.data;
  }
  
  /**
   * Get a Genomic Event with Therapeutic Association
   * @param {String} patient - patient, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API reponse data
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(patient, report, ident) {
    const resp = await this.$http.get(
      `${this.api}/${patient}/report/${report}/genomic/summary/genomicEventsTherapeutic/${ident}`,
    );
    return resp.data;
  }
  
  /**
   * Update a Genomic Event with Therapeutic Association
   * @param {String} patient - patient, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @param {*} get - Genomic Events
   * @return {promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(patient, report, ident, get) {
    const resp = await this.$http.put(
      `${this.api}/${patient}/report/${report}/genomic/summary/genomicEventsTherapeutic/${ident}`,
      get,
    );
    return resp.data;
  }
  
  /**
   * Remove a Genomic Event with Therapeutic Association
   * @param {String} patient - patient, eg POG129
   * @param {String} report - report ident
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(patient, report, ident) {
    const resp = await this.$http.delete(
      `${this.api}/${patient}/report/${report}/genomic/summary/genomicEventsTherapeutic/${ident}`,
    );
    return resp.data;
  }
}

export default GenomicEventsService;
