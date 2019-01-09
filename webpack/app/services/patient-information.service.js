class PatientInformation {
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get Patient Information for POG
   * @param {String} POGID - POGID as String
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(POGID) {
    const resp = await this.$http.get(`${this.api}/${POGID}/patientInformation`);
    return resp.data;
  }

  /**
   * Update patient information
   * @param {String} POGID - POGID as String
   * @param {Object} pi - Patient info object
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(POGID, pi) {
    const resp = await this.$http.put(`${this.api}/${POGID}/patientInformation`, pi);
    return resp.data;
  }
}

export default PatientInformation;
