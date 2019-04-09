class Service {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = 'https://lims16.bcgsc.ca/alpha/limsapi';
  }

  /**
   * Get LIMS disease ontology
   *
   * @param {String} query - input string to search for
   *
   * @returns {Promise} - result of API call
   */
  async getDiseaseOntology(query) {
    const { data } = await this.$http.get(`${this.api}/elastic/disease_ontology/${query}`, { headers: { 'Accept': 'application/json', 'Authorization': undefined } });
    return data;
  }

  /**
   * Get sample information for a specified patient from LIMS
   *
   * @param {String|List} pogs - a string for a single pogid or list of multiple pogids
   *
   * @returns {Promise} - result of API call
   */
  async getSampleInformation(pogs) {
    // Convert string pogid to array
    if (typeof pogs === 'string') {
      pogs = [pogs];
    }

    const body = {
      filters: {
        op: 'in',
        content: {
          field: 'participant_study_id',
          value: pogs,
        },
      },
    };
    
    const { data } = await this.$http.post(`${this.api}/sample`, body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } });
    return data;
  }

  /**
   * Get source information for a specified patient from LIMS
   *
   * @param {String|Array} pogs - a string for a single pogid or list of multiple pogids
   *
   * @returns {Promise} - result of API call
   */
  async getSourceInformation(pogs) {
    // Convert string pogid to array
    if (typeof pogs === 'string') {
      pogs = [pogs];
    }

    const body = {
      filters: {
        op: 'in',
        content: {
          field: 'participant_study_id',
          value: pogs,
        },
      },
    };
    
    const { data } = await this.$http.post(`${this.api}/source`, body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } });
    return data;
  }

  /**
   * Get library information for specified libraries in LIMS
   *
   * @param {Array} names - list of library names to look up
   *
   * @returns {Promise} - result of API call
   */
  async getLibraryInformation(names) {
    // Convert string library name to array
    if (typeof names === 'string') {
      names = [names];
    }

    const body = {
      filters: {
        op: 'in',
        content: {
          field: 'name',
          value: names,
        },
      },
    };
    
    const { data } = await this.$http.post(`${this.api}/library`, body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } });
    return data;
  }

  /**
   * Get Illumina Sequencing Run information for specified libraries in LIMS
   *
   * @param {Array} libraries - list of library names to look up
   *
   * @returns {Promise} - result of API call
   */
  async getRunInformation(libraries) {
    // Convert string library name to array
    if (typeof libraries === 'string') {
      libraries = [libraries];
    }

    const body = {
      filters: {
        op: 'or',
        content: [
          {
            op: 'in',
            content: {
              field: 'library',
              value: libraries,
            },
          },
          {
            op: 'in',
            content: {
              field: 'multiplex_library',
              value: libraries,
            },
          },
        ],
      },
    };
    
    const { data } = await this.$http.post(`${this.api}/illumina_run`, body, { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } });
    return data;
  }
}
  
export default Service;
