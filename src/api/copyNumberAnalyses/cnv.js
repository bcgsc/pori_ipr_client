/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.copyNumberAnalyses.cnv', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $cnv = {};


  $cnv.all = (pog, report) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/'+ report +'/genomic/copyNumberAnalyses/cnv').then(
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

  $cnv.one = (pog, report, ident) => {
    return {
      update: (data) => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/'+ report +'/genomic/copyNumberAnalyses/cnv/' + ident, data).then(
          (resp) => {
            deferred.resolve(resp.data);
          },
          (error) => {
            console.log('Unable to update CNV', error);
            deferred.reject('Unable to update');
          }
        );

        return deferred.promise;
      }
    }
  };

  // Get alterations by specific type
  $cnv.getType = (pog, report, type) => {
    let deferred = $q.defer();

    $http.get(api + '/'  + pog + '/report/'+ report +'/genomic/copyNumberAnalyses/cnv/' + type).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (error) => {
        deferred.reject('Unable to retrieve the requested cnv', error);
      }
    );

    return deferred.promise;
  };

  return $cnv;

}]);
