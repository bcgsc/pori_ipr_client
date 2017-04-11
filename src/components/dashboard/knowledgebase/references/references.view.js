app.controller('knowledgebase.references.view',
['$q', '_', '$scope', '$mdDialog', 'api.knowledgebase', 'reference',
($q, _, scope, $mdDialog, $kb, reference) => {

  scope.reference = reference;

  console.log(scope);

  scope.cancel = () => {
    $mdDialog.hide();
  };

}]);