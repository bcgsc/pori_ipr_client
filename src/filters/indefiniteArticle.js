app.filter('indefiniteArticle', () => {
  return (noun) => {
    return (['a','e','i','o','u'].indexOf(noun.charAt(0)) > -1) ? 'an' : 'a';
  }
});