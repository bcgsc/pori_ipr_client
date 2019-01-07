/**
 * Formats the date application wide
 * @param {*} $mdDateLocaleProvider
 * {@link https://material.angularjs.org/latest/api/service/$mdDateLocaleProvider}
 * @return {String} formatted date
 */
function dateFormat($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '';
  };
}

dateFormat.$inject = ['$mdDateLocaleProvider'];

angular
  .module('bcgscIPR')
  .config(dateFormat);
