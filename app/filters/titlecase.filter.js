/**
 * Capitalize first letter in each word of string and set rest to lowercase
 * @return {Function} titleCase
 */
const titleCase = () => {
  return (input) => {
    input = input || '';
    return input.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };
};

export default titleCase;
