/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.lims', ['$http', '$q', ($http, $q) => {
  const api = 'https://lims16.bcgsc.ca/api_test/limsapi';

  const $lims = {};

  $lims.diseaseOntology = async (query) => {
    const { data } = await $http.get(`${api}/elastic/disease_ontology/${query}`);
    return data;
  };
  
  
  /**
   * Get source information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $lims.biologicalMetadata = async (pogs, field = 'participantStudyID') => {
    // Convert string pogid to array
    if (typeof pogs === 'string') {
      pogs = [pogs];
    }

    const body = {
      filters: {
        op: 'in',
        content: {
          field,
          value: pogs,
        },
      },
    };
    
    const { data } = await $http.post(
      `${api}/biological-metadata/search`,
      body,
      { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } },
    );
    return data;
  };
  
  
  /**
   * Get Library information from LIMS
   *
   * @param {array} names - Names of libraries to look up
   * @returns {*}
   */
  $lims.libraries = async (names, field = 'originalSourceName') => {
    if (typeof names === 'string') {
      names = [names];
    }

    const body = {
      filters: {
        op: 'in',
        content: {
          field,
          value: names,
        },
      },
    };
    
    const { data } = await $http.post(
      `${api}/libraries/search`,
      body,
      { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } },
    );
    return data;
  };
  
  
  /**
   * Get Illumina Sequencing Run information from LIMS
   *
   * @param {array} libraries - Libraries to look up
   * @returns {*}
   */
  $lims.sequencerRuns = async (libraries) => {
    if (typeof names === 'string') {
      libraries = [libraries];
    }

    const body = {
      filters: {
        op: 'or',
        content: [
          {
            op: 'in',
            content: {
              field: 'libraryName',
              value: libraries,
            },
          },
          {
            op: 'in',
            content: {
              field: 'multiplexLibraryName',
              value: libraries,
            },
          },
        ],
      },
    };
    
    const { data } = await $http.post(
      `${api}/sequencer-runs/search`,
      body,
      { headers: { Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+' } },
    );
    return data;
  };

  return $lims;
}]);
