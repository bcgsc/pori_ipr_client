/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.somaticMutations.smallMutations', ['_', '$http', '$q', (_, $http, $q) => {

  const api = 'http://10.9.202.110:8001' + '/api/1.0/POG';

  let $smallMutations = {};


  $smallMutations.all = (pog) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/genomic/somaticMutations/smallMutations').then(
      (resp) => {
        // Successful authentication
        deferred.resolve(resp.data);
      },
      (error) => {
        deferred.reject('Unable to retrieve');
      }
    );

    return deferred.promise;

  }

  $smallMutations.one = (pog, ident) => {
    return {
      update: (data) => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/genomic/somaticMutations/smallMutations/' + ident, data).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (error) => {
            console.log('Unable to update APC', error);
            deferred.reject('Unable to update');
          }
        );

        return deferred.promise;
      }
    }
  }

  // Get alterations by specific type
  $smallMutations.getType = (pog, type) => {
    let deferred = $q.defer();

    $http.get(api + '/'  + pog + '/genomic/somaticMutations/smallMutations/' + type).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (error) => {
        deferred.reject('Unable to retrieve requested alterations', error);
      }
    );

    return deferred.promise;
  }

  return $smallMutations;

}]);
