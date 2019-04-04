app.controller('knowledgebase.events.filter',
  ['$q', '_', '$scope', '$mdDialog', 'api.knowledgebase', 'filters',
    ($q, _, scope, $mdDialog, $kb, filters) => {

      scope.cancel = () => {
        $mdDialog.hide();
      };

      // Setup starting place filters
      scope.filter = filters;
      if(!scope.filter.key) scope.filter.key = [];
      if(!scope.filter.name) scope.filter.name = [];
      if(!scope.filter.display_coord) scope.filter.display_coord = [];
      if(!scope.filter.notation) scope.filter.notation = [];
      if(!scope.filter.related_events) scope.filter.related_events = [];

      // Set Vocab
      scope.new = {
        values: {
          key: null,
          name: null,
          display_coord: null,
          notation: null,
          related_events: null
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
        if(query.length < 3) deferred.resolve([]);

        if(query.length >= 3) {
          $kb.diseaseOntology(query).then(
            (entries) => {
              deferred.resolve(entries);
            },
            (err) => {
              console.log('Unable to search for disease-ontology entries', err);
            }
          );
        }
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
        $mdDialog.hide(scope.filter);
      }

    }]);