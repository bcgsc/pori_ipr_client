import { $http } from 'ngimport';

class ImageService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  /**
   * Retrieve one image from API.
   * @param {String} report - Analysis report ident
   * @param {String} key - key
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async get(report, key) {
    const { data } = await $http.get(
      `${this.api}/${report}/image/retrieve/${key}`,
    );
    return data;
  }

  /**
   * Get Density Graphs
   * @param {String} report - Analysis report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async expDensityGraphs(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/image/expression-density-graphs`,
    );
    return data;
  }

  /**
   * Retrieve Mutation Summary images for this report
   * @param {String} report - Analysis report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async mutationBurden(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/image/mutation-burden`,
    );
    return data;
  }

  /**
   * Get Subtype Plots
   * @param {String} report - Analysis report ident
   * @return {Promise} API response data
   * @throws {ErrorType} Thrown when API call fails
   */
  async subtypePlots(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/image/subtype-plots`,
    );
    return data;
  }
}

export default new ImageService();
