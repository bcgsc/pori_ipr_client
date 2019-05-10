/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.lims', ['$http', ($http) => {
  const api = CONFIG.ENDPOINTS.API;

  const $lims = {};

  $lims.diseaseOntology = async (query) => {
    const { data } = await $http.get(`${api}/lims/disease-ontology/${query}`);
    return data;
  };
  
  
  /**
   * Get source information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $lims.biologicalMetadata = async (patientIds, searchField = 'participantStudyId') => {
    const { data } = await $http.post(
      `${api}/lims/biological-metadata`,
      { patientIds, searchField },
    );
    return data;
  };
  
  
  /**
   * Get Library information from LIMS
   *
   * @param {array} names - Names of libraries to look up
   * @returns {*}
   */
  $lims.libraries = async (libraries, searchField = 'originalSourceName') => {
    const { data } = await $http.post(
      `${api}/lims/library`,
      { libraries, searchField },
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
    const { data } = await $http.post(
      `${api}/lims/sequencer-run`,
      { libraries },
    );
    return data;
  };

  return $lims;
}]);
