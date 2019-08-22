class PatientInformationService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  /**
   * Get Patient Information for POG
   * @param {String} pogID - pogID as String
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID) {
    const resp = await this.$http.get(`${this.api}/${pogID}/patientInformation`);
    return resp.data;
  }

  /**
   * Update patient information
   * @param {String} pogID - pogID as String
   * @param {Object} pi - Patient info object
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(pogID, pi) {
    const resp = await this.$http.put(`${this.api}/${pogID}/patientInformation`, pi);
    return resp.data;
  }
}

export default PatientInformationService;
