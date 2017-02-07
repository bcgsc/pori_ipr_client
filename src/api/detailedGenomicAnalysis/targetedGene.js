/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.detailedGenomicAnalysis.targetedGenes', ['_', '$http', '$q', (_, $http, $q) => {

  const api = 'http://localhost:8001' + '/api/1.0/POG';

  let $tg = {};


  $tg.getAll = (pog) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/genomic/detailedGenomicAnalysis/targetedGenes').then(
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

  $tg.one = (pog, ident) => {
    return {

      get: () => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/genomic/detailedGenomicAnalysis/targetedGenes/' + ident, data).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (error) => {
            console.log('Unable to retrieve targeted gene record', error);
            deferred.reject('Unable to retrieve the requested record');
          }
        );

        return deferred.promise;
      },

      update: (data) => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/genomic/detailedGenomicAnalysis/targetedGenes/' + ident, data).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (error) => {
            console.log('Unable to ', error);
            deferred.reject('Unable to update');
          }
        );

        return deferred.promise;
      }
    }
  }

  return $tg;

}]);
