/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.copyNumberAnalyses.cnv', ['_', '$http', '$q', (_, $http, $q) => {

  const api = 'http://10.9.202.110:8001' + '/api/1.0/POG';

  let $cnv = {};


  $cnv.all = (pog) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/genomic/copyNumberAnalyses/cnv').then(
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

  $cnv.one = (pog, ident) => {
    return {
      update: (data) => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/genomic/copyNumberAnalyses/cnv/' + ident, data).then(
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
  }

  // Get alterations by specific type
  $cnv.getType = (pog, type) => {
    let deferred = $q.defer();

    $http.get(api + '/'  + pog + '/genomic/copyNumberAnalyses/cnv/' + type).then(
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
