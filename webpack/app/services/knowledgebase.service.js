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
    const resp = await this.$http.get(`${this.api}/controlled-vocabulary`);
    return resp.data;
  }

  /**
   * Validate KB event string
   *
   * @param {String} input - input string to be validated against KB regex
   *
   * @returns {Promise} - resolves w/ {valid: {input}}
   */
  async validateEvent(input) {
    const resp = await this.$http.post(`${this.api}/validate/events`, { events_expression: input });
    return resp.data;
  }

  /**
   * Check for a gene or variant in KB & HUGO
   *
   * @param {String} query - input string to search for
   *
   * @returns {Promise} - array of matching text values
   */
  async getGenevar(query) {
    const resp = await this.$http.get(`${this.api}/genevar`, { params: { query } });
    return resp.data;
  }

  /**
   * Get KB metrics
   *
   * @returns {Promise} - object containing key-value pairs of metric data
   */
  async getMetrics() {
    const resp = await this.$http.get(`${this.api}/metrics`);
    return resp.data;
  }

  /**
   * Search disease ontology list
   *
   * @param {String} query - input string to search for
   *
   * @returns {Promise} - array of matching text values
   */
  async getDiseaseOntology(query) {
    const resp = await this.$http.get(`${this.api}/disease-ontology`, { params: { query } });
    return resp.data;
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
    const resp = await this.$http.get(`${this.api}/history`, { params: { type, entry: ident } });
    return resp.data;
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
    Object.entries(filters).forEach((keyvals) => {
      const filter = keyvals[0];
      const value = keyvals[1];
      if (filter === 'search') {
        processFilters[filter] = value;
      } else {
        processFilters[filter] = value.join(',');
      }
    });

    const opts = { params: processFilters };
    opts.params.limit = limit;
    opts.params.offset = offset;

    const resp = await this.$http.get(`${this.api}/references`, opts);
    return resp.data;
  }
}
  
export default KnowledgebaseService;
