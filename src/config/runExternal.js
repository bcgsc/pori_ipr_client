// /**
//  * Run block checking if user has an external connection
//  * @param {*} $rootScope {@link https://docs.angularjs.org/api/ng/service/$rootScope}
//  * @param {*} $user - $user factory
//  * @param {*} _ {@link https://lodash.com/docs/4.17.5}
//  * @param {*} $acl - $acl service
//  * @return {*} None
//  */
// function runExternal($rootScope, $user, _, $acl) {
//   /**
//    * Global Permission Resource Lookup
//    *
//    * @param {string} r - Resource name
//    * @returns {boolean} - User is allowed to see resource
//    * @private
//    */
//   $rootScope.SES_permissionResource = $acl.resource;
//   $rootScope.SES_permissionAction = $acl.action;
  
//   $user.me()
//     .then((u) => {
//       // Check for Clinician or Collaborator group
//       // Temporary logic to hide UI elements.
//       $rootScope.isExternalMode = _.find(_.mapValues(u.groups, (r) => {
//         return { name: r.name.toLowerCase() };
//       }), { 'name': 'clinician' }) || _.find(_.mapValues(u.groups, (r) => {
//         return { name: r.name.toLowerCase() };
//       }), { 'name': 'collaborator' });
//       // TODO: Plugin to API permission system
//     })
//     .catch((err) => {
//       // Probably not logged in....
//       $rootScope.isExternalMode = false;
//       console.log('run user error', err);
//     });
// }

// runExternal.$inject = ['$rootScope', 'api.user', '_', '$acl'];

// angular
//   .module('bcgscIPR')
//   .run(runExternal);
