
/*
 * User Edit Injector on RootScope
 *
 * Calls user API on run and checks for editing permissions.
 * Current iteration only checks for presence of clinician group. If found, no editing capability will be
 * provided.
 *
 *
 */

app.run(['$rootScope', '$http', '$injector', '$cookies', 'api.user', '_', ($rootScope, $http, $injector, $cookies, $user, _) => {
  // Retrieve token from local storage
  const token = $cookies.get('BCGSC_SSO');
  
  // Token exists?
  if (token) {
    $http.defaults.headers.common.Authorization = token;
  }
  
  let user;

  const $acl = $injector.get('$acl');
  
  /**
   * Global Permission Resource Lookup
   *
   * @param {string} r - Resource name
   * @returns {boolean} - User is allowed to see resource
   * @private
   */
  $rootScope.SES_permissionResource = $acl.resource;
  $rootScope.SES_permissionAction = $acl.action;
  
  // $user.me()
  //   .then((u) => {
  //     console.log(u);
  //     // Check for Clinician or Collaborator group
  //     // Temporary logic to hide UI elements.
  //     $rootScope._externalMode = (_.find(_.mapValues(u.groups, (r) => { return {name: r.name.toLowerCase()}}), {'name': 'clinician'}) || _.find(_.mapValues(u.groups, (r) => { return {name: r.name.toLowerCase()}}), {'name': 'collaborator'}));
      
  //     // TODO: Plugin to API permission system
  //     user = u;
  //   })
  //   .catch((err) => {
  //     // Probably not logged in....
  //     $rootScope._externalMode = false;
  //     console.log('run user error', err);
  //   });
}]);
