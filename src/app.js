const app = angular.module('bcgscIPR', [
//	'env',
  'templates',
	'ngMaterial',
	'ngResource',
	'ngSanitize',
	'ui.router',
	'angularMoment',
	'ngStorage',
	'angularFileUpload',
	'ngclipboard',
	'angular-sortable-view',
	'ngQuill',
	'chart.js',
	'btford.socket-io',
	'ngMessages',
]);

// Register HTTP Error Handler
app.run(httpErrorHandler);


function httpErrorHandler($rootScope, toastService) {
  $rootScope.$on( 'httpError', (event, eventData) => {
    toastService.serverError(eventData.message);
  });
}

httpErrorHandler.$inject = ['$rootScope', 'toastService'];