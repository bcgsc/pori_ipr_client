/**
 * Capitalize first word in string and set rest to lowercase
 * @return {Function} capitalize
 */
const capitalize = () => {
  return (input) => {
    return (input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  };
};

angular
  .module('bcgscIPR')
  .filter('capitalize', capitalize);
