class ImageService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Retrieve one image from API.
   * @param {String} pogID - pogID as string ex: POG960
   * @param {String} report - Analysis report ident
   * @param {String} key - key
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(pogID, report, key) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/image/retrieve/${key}`,
    );
    return data;
  }

  /**
   * Get Density Graphs
   * @param {String} pogID - pogID as string ex: POG960
   * @param {String} report - Analysis report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async expDensityGraphs(pogID, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/image/expressionDensityGraphs`,
    );
    return data;
  }
  
  /**
   * Retrieve Mutation Summary images for this POG
   * @param {String} pogID - pogID as string ex: POG960
   * @param {String} report - Analysis report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async mutationSummary(pogID, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/image/mutationSummary`,
    );
    return data;
  }

  /**
   * Get Subtype Plots
   * @param {String} pogID - pogID as string ex: POG960
   * @param {String} report - Analysis report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async subtypePlots(pogID, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/image/subtypePlots`,
    );
    return data;
  }
}

export default ImageService;
