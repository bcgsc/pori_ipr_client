/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.project', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = CONFIG.ENDPOINTS.API + '/projects';
  
  
  let $project = {};
  
  
  /**
   * Get All Projects
   *
   * Retrieve all projects from API that user can access
   *
   * @returns {promise} - Resolves with array of projects
   */
  $project.all = () => {
    return $q((resolve, reject) => {
      
      // Retrieve from API
      $http.get(api).then(
        (result) => {
          resolve(result.data);
        },
        (error) => {
          // TODO: Better error handling
          reject(error);
        }
      );
      
    });
    
  };
  
  return $project;
  
}]);
