/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.geneViewer', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/POG';
  
  let $gv = {};
  
  $gv.get = (pog, report, gene) => {
    return $q((resolve, reject) => {
      // Get result from API
      $http.get(api + '/' + pog + '/report/' + report + '/geneviewer/' + gene).then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject();
        }
      );
    });
  
  };
  
  
  return $gv;
  
}]);
