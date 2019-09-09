app.controller('knowledgebase.references.filter',
['$q', '_', '$scope', '$mdDialog', 'api.knowledgebase', 'vocabulary', 'filters',
($q, _, scope, $mdDialog, $kb, vocabulary, filters) => {

  scope.cancel = () => {
    $mdDialog.hide();
  };

  // Setup starting place filters
  scope.filter = angular.copy(filters);
  if(!scope.filter.disease_list) scope.filter.disease_list = [];
  if(!scope.filter.context) scope.filter.context = [];
  if(!scope.filter.evidence) scope.filter.evidence = [];
  if(!scope.filter.events_expression) scope.filter.events_expression = [];
  if(!scope.filter.ref_id) scope.filter.ref_id = [];
  if (!scope.filter.ident) {
    scope.filter.ident = [];
  }

  // Set Vocab
  scope.vocabulary = vocabulary;
  scope.new = {
    values: {
      disease_list: null,
      context: null,
      evidence: null,
      events_expression: null,
      ref_id: null,
      ident: null,
    }
  };

  // Transform chip for auto complete
  scope.transformChip = (disease) => {
    // If it is an object, it's already a known chip
    if (angular.isObject(disease)) return disease;

    // Otherwise, create a new one
    return { disease: disease, type: 'new' }
  };


  // Auto-complete search filter
  scope.disease = {search: []};
  scope.disease.filter = (query) => {
    let deferred = $q.defer();
    $kb.diseaseOntology(query).then(
      (entries) => {
        // remove entries that have already been selected
        let unselected_entries = _.differenceBy(entries, scope.filter.disease_list);
        deferred.resolve(unselected_entries);
      },
      (err) => {
        console.log('Unable to search for disease-ontology entries', err);
      }
    );
    return deferred.promise;
  };

  // New Freeform Entry
  scope.new.action = (type) => {
    if(scope.new.values[type] === null || scope.new.values[type] === undefined) return null;

    // Create new Disease entry filter
    scope.filter[type].push(scope.new.values[type]);
    scope.disease.search[scope.disease.search.length] = scope.new.values[type];
    scope.new.values[type] = null;
  };

  // Remove filter entry
  scope.removeFilterEntry = (type, index) => {
    scope.filter[type].splice(index, 1);
  };

  scope.save = () => {
    if (scope.new.values.ident && scope.new.values.ident.length) {
      scope.filter.ident.push(scope.new.values.ident);
    }
    $mdDialog.hide(scope.filter);
  }

}]);