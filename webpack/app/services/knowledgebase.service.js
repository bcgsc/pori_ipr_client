class KnowledgebaseService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/knowledgebase`;
  }

  /**
   * Get controlled vocabulary
   *
   * @returns {Promise} - result of API call
   */
  async getVocabulary() {
    const { data } = await this.$http.get(`${this.api}/controlled-vocabulary`);
    return data;
  }

  /**
   * Validate KB event string
   *
   * @param {String} input - input string to be validated against KB regex
   *
   * @returns {Promise} - resolves w/ {valid: {input}}
   */
  async validateEvent(input) {
    const { data } = await this.$http.post(`${this.api}/validate/events`, { events_expression: input });
    return data;
  }

  /**
   * Check for a gene or variant in KB & HUGO
   *
   * @param {String} query - input string to search for
   *
   * @returns {Promise} - array of matching text values
   */
  async getGenevar(query) {
    const { data } = await this.$http.get(`${this.api}/genevar?query=${query}`);
    return data;
  }

  /**
   * Get KB metrics
   *
   * @returns {Promise} - object containing key-value pairs of metric data
   */
  async getMetrics() {
    const { data } = await this.$http.get(`${this.api}/metrics`);
    return data;
  }

  /**
   * Search disease ontology list
   *
   * @param {String} query - input string to search for
   *
   * @returns {Promise} - array of matching text values
   */
  async getDiseaseOntology(query) {
    const { data } = await this.$http.get(`${this.api}/disease-ontology?query=${query}`);
    return data;
  }

  /**
   * Get change history for a data entry
   *
   * @param {String} type - type of entry to look up history for (entry, reference, etc.)
   * @param {String} ident - UUIDv4 identification string
   *
   * @returns {Promise} - array of change history events
   */
  async getChangeHistory(type, ident) {
    const { data } = await this.$http.get(`${this.api}/history`, { params: { type, entry: ident } });
    return data;
  }

  /**
   * Get KB references w/ pagination
   *
   * @param {Number} limit - max number of records to return
   * @param {Number} offset - pagination start point
   * @param {Object} filters - query string filter arguments
   *
   * @returns {Promise} - collection of references
   */
  async getReferences(limit = 100, offset = 0, filters = {}) {
    const processFilters = {};

    // Process Filters
    _.forEach(filters, (value, filter) => {
      if (filter === 'search') {
        processFilters[filter] = value;
      } else {
        processFilters[filter] = _.join(value, ',');
      }
    });

    const opts = { params: processFilters };
    opts.params.limit = limit;
    opts.params.offset = offset;

    const { data } = await this.$http.get(`${this.api}/references`, opts);
    return data;
  }
}
  
export default KnowledgebaseService;
