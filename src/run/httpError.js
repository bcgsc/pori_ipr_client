/**
 * Http error handler for toasts
 * @param {*} $rootScope {@link https://docs.angularjs.org/api/ng/service/$rootScope}
 * @param {*} toastService - toastService factory
 * @return {*} httpErrorHandler
 */
function httpErrorHandler($rootScope, toastService) {
  $rootScope.$on('httpError', (event, eventData) => {
    toastService.serverError(eventData.message);
  });
}

httpErrorHandler.$inject = ['$rootScope', 'toastService'];

angular
  .module('bcgscIPR')
  .run(httpErrorHandler);
