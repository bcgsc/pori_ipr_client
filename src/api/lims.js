/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.lims', ['_', '$http', '$q', (_, $http, $q) => {

  const api = 'https://lims16.bcgsc.ca';

  let $lims = {};

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
   * Get sample information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $lims.sample = (pogs) => {
    return $q((resolve, reject) => {
  
      // Convert string pogid to array
      if(typeof pogs === 'string') {
        pogs = [pogs];
      }
  
      let body = {
        filters: {
          op: "in",
          content: {
            field: "participant_study_id",
            value: pogs
          }
        }
      };
      
      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/sample', body, {headers: {Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+'}}).then(
        (result) => {
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to get LIMS sample result', err);
          reject(err);
        });
      
    
    });
  };
  
  
  /**
   * Get source information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $lims.source = (pogs) => {
    return $q((resolve, reject) => {
  
      // Convert string pogid to array
      if(typeof pogs === 'string') {
        pogs = [pogs];
      }
  
      let body = {
        filters: {
          op: "in",
          content: {
            field: "participant_study_id",
            value: pogs
          }
        }
      };
      
      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/source', body, {headers: {Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+'}}).then(
        (result) => {
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to get LIMS sample result', err);
          reject(err);
        });
      
    
    });
  };
  
  
  /**
   * Get Library information from LIMS
   *
   * @param {array} names - Names of libraries to look up
   * @returns {*}
   */
  $lims.library = (names) => {
    return $q((resolve, reject) => {
  
      if(typeof names === 'string') {
        names = [names];
      }
  
      let body = {
        filters: {
          op: "in",
          content: {
            field: "name",
            value: names
          }
        }
      };
      
      $http.post('https://lims16.bcgsc.ca/alpha/limsapi/library', body, {headers: {Authorization: 'Basic YnBpZXJjZTprNHRZcDNScnl+'}}).then(
        (result) => {
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to get LIMS library result', err);
          reject(err);
        });
      
    
    });
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
