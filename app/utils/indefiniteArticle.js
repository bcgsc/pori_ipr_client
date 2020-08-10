/**
 * Changes word prefix to 'an' or 'a' depending on the word
 * @return {Function} indefiniteArticle
 */
const indefiniteArticle = noun => ((['a', 'e', 'i', 'o', 'u'].includes(noun.charAt(0))) ? 'an' : 'a');

export default indefiniteArticle;
