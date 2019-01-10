class GenomicEvents {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = CONFIG.ENDPOINTS.API + '/POG';
  }
  
  /**
   * Get Genomic Events with Therapeutic Association
   * Retrieve all POGs from API that user can access
   * @param {String} POGID - POGID as String
   * @param {Object} report - report Object
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async all(POGID, report) {
    const resp = await this.$http.get(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicEventsTherapeutic`,
    );
    return resp.data;
  }
  
  /**
   * Get a Genomic Event with Therapeutic Association
   * @param {String} POGID - POGID, eg POG129
   * @param {Object} report - report Object
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API reponse data
   * @throws {ErrorType} Thrown when API call fails
   */
  async id(POGID, report, ident) {
    const resp = await this.$http.get(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicEventsTherapeutic/${ident}`,
    );
    return resp.data;
  }
  
  /**
   * Update a Genomic Event with Therapeutic Association
   * @param {String} POGID - POGID, eg POG129
   * @param {Object} report - report object
   * @param {String} ident - UUID4 identity string for entry
   * @param {*} get - Genomic Events 
   * @return {promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(POGID, report, ident, get) {
    const resp = await this.$http.put(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicEventsTherapeutic/${ident}`,
      get
    );
    return resp.data;
  }
  
  /**
   * Remove a Genomic Event with Therapeutic Association
   * @param {String} POGID - POGID, eg POG129
   * @param {Object} report - report object
   * @param {String} ident - UUID4 identity string for entry
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async remove(POGID, report, ident) {
    const resp = await this.$http.delete(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicEventsTherapeutic/${ident}`,
    );
    return resp.data;
  }
}

export default GenomicEvents;
