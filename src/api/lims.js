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

  $lims.diseaseOntology = (query) => {

    return $q((resolve, reject) => {

      let req = $http({
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Authorization': undefined
        },
        url: api + '/alpha/limsapi/elastic/disease_ontology/' + query,
      });

      //let = $http.get(api + '/elastic_search', opts)

      req.then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      )

    });

  };
  
  
  /**
   * Get source information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $lims.biologicalMetadata = async (pogs) => {
    // Convert string pogid to array
    if (typeof pogs === 'string') {
      pogs = [pogs];
    }

    const body = {
      filters: {
        op: 'in',
        content: {
          field: 'participantStudyId',
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
  $lims.libraries = async (names) => {
    if (typeof names === 'string') {
      names = [names];
    }

    const body = {
      filters: {
        op: 'in',
        content: {
          field: 'originalSourceName',
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
  $lims.illumina_run = (libraries) => {
    return $q((resolve, reject) => {
  
      if(typeof names === 'string') {
        libraries = [libraries];
      }
  
      let body = {
        filters: {
          op: "or",
          content: [
            {
              op: "in",
              content: {
                field: "library",
                value: libraries
              }
            },
            {
              op: "in",
              content: {
                field: "multiplex_library",
                value: libraries
              }
            }
          ]
        }
      };
      
      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/illumina_run', body, {headers: {Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+'}}).then(
        (result) => {
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to get LIMS Illumina run result', err);
          reject(err);
        });
      
    
    });
  };


  return $lims;

}]);
