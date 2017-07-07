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

      let opts = {
        params: {
          search: query,
          namespace: 'ontology',
          table: 'disease_ontology'
        },
        headers: {}
      };


      let req = $http({
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Authorization': undefined
        },
        url: api + '/dev/elastic_search',
        params: opts.params
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


  return $lims;

}]);
