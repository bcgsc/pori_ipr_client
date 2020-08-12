/**
 * Takes a word or sentence and converts each word to startCase
 * @param {string} str string to be converted
 * @param {string} delimiter optional delimiter
 */
const startCase = (str, delimiter = ' ') => {
  const splitStr = str.split(delimiter)
  const splitStrStartCase = splitStr.map(word => word.slice(0, 1).toUpperCase().concat(word.slice(1)));
  return splitStrStartCase.join(delimiter);
};

export default startCase;