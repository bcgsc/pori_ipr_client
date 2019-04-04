/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.detailedGenomicAnalysis.targetedGenes', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $tg = {};


  $tg.getAll = (pog, report) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/'+ report +'/genomic/detailedGenomicAnalysis/targetedGenes').then(
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

  $tg.one = (pog, report, ident) => {
    return {

      get: () => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/'+ report +'/genomic/detailedGenomicAnalysis/targetedGenes/' + ident, data).then(
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

        $http.put(api + '/' + pog + '/report/'+ report +'/genomic/detailedGenomicAnalysis/targetedGenes/' + ident, data).then(
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
  };

  return $tg;

}]);
