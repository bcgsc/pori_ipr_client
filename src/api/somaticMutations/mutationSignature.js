/*
 * BCGSC - IPR-Client Mutation Signature API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.somaticMutations.mutationSignature', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $mutationSignature = {};

  $mutationSignature.all = (pog) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/genomic/somaticMutations/mutationSignature').then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (error) => {
        console.log(error);
        deferred.reject('Unable to retrieve');
      }
    );
    return deferred.promise;

  };

  return $mutationSignature;
}]);
