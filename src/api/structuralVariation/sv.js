/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.structuralVariation.sv', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $sv = {};


  $sv.all = (pog) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/genomic/structuralVariation/sv').then(
      (resp) => {
        // Successful authentication
        deferred.resolve(resp.data);
      },
      (error) => {
        deferred.reject('Unable to retrieve');
      }
    );

    return deferred.promise;

  };

  $sv.one = (pog, ident) => {
    return {
      update: (data) => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/genomic/structuralVariation/sv/' + ident, data).then(
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
  };

  // Get alterations by specific type
  $sv.getType = (pog, type) => {
    let deferred = $q.defer();

    $http.get(api + '/'  + pog + '/genomic/structuralVariation/sv/' + type).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (error) => {
        deferred.reject('Unable to retrieve requested structural variation', error);
      }
    );

    return deferred.promise;
  };

  return $sv;

}]);
