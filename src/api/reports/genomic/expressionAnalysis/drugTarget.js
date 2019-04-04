/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.expressionAnalysis.drugTarget', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.API + '/POG';

  let $drugTarget = {};


  $drugTarget.all = (pog, report) => {

    let deferred = $q.defer();

    $http.get(api + '/' + pog + '/report/'+ report +'/genomic/expressionAnalysis/drugTarget').then(
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

  $drugTarget.one = (pog, report, ident) => {
    return {
      update: (data) => {
        let deferred = $q.defer();

        $http.put(api + '/' + pog + '/report/'+ report +'/genomic/expressionAnalysis/drugTarget/' + ident, data).then(
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
  $drugTarget.getType = (pog, report, type) => {
    let deferred = $q.defer();

    $http.get(api + '/'  + pog + '/report/'+ report +'/genomic/expressionAnalysis/drugTarget/' + type).then(
      (resp) => {
        deferred.resolve(resp.data);
      },
      (error) => {
        deferred.reject('Unable to retrieve requested alterations', error);
      }
    );

    return deferred.promise;
  };

  return $drugTarget;

}]);
