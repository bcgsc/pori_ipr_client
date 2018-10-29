const app = angular.module('bcgscIPR', [
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
  'ngCookies',
  'angular-async-await',
])
.config(function($mdThemingProvider) {
  let gscBlueMap = $mdThemingProvider.extendPalette('indigo' , {
    '500': 'rgb(38, 50, 140)'
  });

  $mdThemingProvider.definePalette('gscBlue', gscBlueMap);

  $mdThemingProvider.theme('default').primaryPalette('gscBlue');
  
});

// Register HTTP Error Handler
app.run(httpErrorHandler);


function httpErrorHandler($rootScope, toastService) {
  $rootScope.$on( 'httpError', (event, eventData) => {
    toastService.serverError(eventData.message);
  });
}

httpErrorHandler.$inject = ['$rootScope', 'toastService'];

// Capitalize first word in string and set rest to lowercase
app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

// Capitalize first letter in each word of string and set rest to lowercase
app.filter('titlecase', function() {
    return function(input) {
      input = input || '';
      return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
  })