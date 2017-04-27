/*
 * BCGSC - VariantDB API Interface
 *
 * This API factory implements the VardDB-API. Calls to and from the API are
 * managed through this factory.
 *
 */
app.factory('api.vardb', ['_', '$http', '$q', (_, $http, $q) => {

  const api = CONFIG.ENDPOINTS.VARDB;
  let _token = null; // User API token
  let authHeader = '4a43e0cb-0d21-446a-bdbc-d3698c3fa1b6'; // TEMPORARY !TODO: Updated auth system for VarDB to store a token

  let $varDB = {};


  /**
   * Get other libraries a variant is found int
   *
   *
   * @params {integer} chromosome
   * @params {integer} position
   * @params {string} ref - The expected base
   * @params {string} alt - The alternate base
   * @returns {Promise|array} - Resolves with an array of library IDs, the count, and the total scanned
   */
  $varDB.variantLibraries = (chromosome, position, ref, alt) => {

    let deferred = $q.defer();

    let opt = {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'text/plain',
      },
      params: {
        chromosome: chromosome,
        position: position,
        ref: ref,
        alt: alt
      }
    };

    $http.get(api + '/variant_libraries', opt).then(
      (result) => {
        deferred.resolve(result.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;

  };


  /**
   * Retrieve library metadata for libraries
   *
   * @param libraries
   * @returns {Promise|collection} - Resolves a collection of library metadata
   */
  $varDB.libraryMeta = (libraries) => {

    let deferred = $q.defer();

    // Convert single library into array
    if(typeof libraries === "string") libraries = [libraries];

    let opts = {};
    opts.params = {libraries: _.join(libraries, ',')};
    opts.headers = {"Authorization": authHeader};

    $http.get(api + '/library_metadata', opts).then(
      (results) => {
        deferred.resolve(results.data);
      },
      (err) => {
        deferred.reject(err);
      }
    );

    return deferred.promise;

  };


  return $varDB;

}]);
