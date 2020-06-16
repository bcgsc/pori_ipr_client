import { $http } from 'ngimport';

class PatientInformationService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  /**
   * Get Patient Information for POG
   * @param {String} reportIdent - report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(reportIdent) {
    const resp = await $http.get(`${this.api}/${reportIdent}/patient-information`);
    return resp.data;
  }

  /**
   * Update patient information
   * @param {String} reportIdent - report ident
   * @param {Object} pi - Patient info object
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async update(reportIdent, pi) {
    const resp = await $http.put(`${this.api}/${reportIdent}/patient-information`, pi);
    return resp.data;
  }
}

export default new PatientInformationService();
