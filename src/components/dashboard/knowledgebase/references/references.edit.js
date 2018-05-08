app.controller('knowledgebase.references.edit',
['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.pubmed', 'api.kb.associations', 'api.knowledgebase', 'api.user', 'action', 'reference', 'vocabulary',
(_, $q, scope, $mdDialog, $mdToast, $complete, $pubmed, $kbAssoc, $kb, $user, action, reference, vocabulary) => {

  scope.$alterations = $complete.get('alterations');
  scope.disableRefTitle = false;
  scope.reference = angular.copy(reference);
  scope.reference.context = _.join(scope.reference.context, ';');
  scope.reference.disease_list = _.join(scope.reference.disease_list, ';');
  scope.formAction = (action === 'new') ? 'Create' : 'Modify';
  scope.vocabulary = vocabulary;
  scope.user = $user._me;
  scope.action = action;

  scope.disease = {};
  scope.disease.all = [];
  scope.disease.new = '';
  scope.disease.all = reference.disease_list;

  scope.context = {};
  scope.context.all = [];
  scope.context.new = '';
  scope.context.all = reference.context;

  scope.stages = [
    {title: 'Event Statement', description: 'Characterization details', id: "matching", ordinal: 0},
    {title: 'Reference Details', description: 'Specifics about the source', id: "reference", ordinal: 1}
  ];
  let activeStage = scope.activeStage = 0;

  scope.$knowledgebase = $complete.get('knowledgebase');

  scope.events = {
    valid: false,
    dirty: true,
    pristine: true,
  };

  scope.lastStage = () => {
    scope.activeStage--;
  };
  scope.nextStage = () => {
    let form;
    // Try to trigger submit...
    switch(scope.activeStage) {
      case 1:
        form = scope.referenceForm;
        break;
      case 0:
        form = scope.matching;
        break;
    }

    form.$setSubmitted();
    if(form.$valid) {
      scope.activeStage++;
    }

    console.log('Stage validity:', form.$valid, form);

    if(!form.$valid) $mdToast.show($mdToast.simple({textContent:'Please check all the fields for errors'}));
  };

  scope.submit = () => {
    scope.matching.$setSubmitted();

    if(!scope.matching.$valid) $mdToast.show($mdToast.simple({textContent:'Please check all the fields for errors'}));

    // All are valid
    if(scope.matching.$valid) {

      scope.reference.disease_list = _.join(scope.disease.all, ';');
      scope.reference.context = _.join(scope.context.all, ';');

      // Send updated entry to API
      if(action === 'new') {
        // Submit new entry
        $kb.references.create(scope.reference).then(
          (newEntry) => {
            $mdDialog.hide({status: 'new', data: newEntry});
          },
          (err) => {
            console.log('Unable to create entry', err);
            $mdToast.show($mdToast.simple({textContent: 'Unable to add new entry. Please try again. If this continues to fail, please leave feedback.'}));
          }
        )
      } else {
        // Update Existing Entry
        $kb.references.update(scope.reference).then(
          (updateEntry) => {
            console.log('Entry saved', updateEntry);
            $mdDialog.hide({status: 'update', data: updateEntry});
          },
          (err) => {
            console.log('Unable to update entry', err);
            $mdToast.show($mdToast.simple({textContent: 'Unable to update the entry. Please try again. If this continues to fail, please leave feedback.'}));
          }
        )
      }

    }
  };

  // Close Dialog
  scope.cancel = () => {
    $mdDialog.cancel('No changes have been made.');
  };

  // Filter Auto-compelte for relevances
  scope.findRelevance = (searchText) => {
    return searchText ? scope.$alterations.association.filter( filterFunction(searchText) ) : scope.$alterations.association;
  };


  // Filter Auto-compelte for relevances
  scope.findDisease = (searchText) => {
    return searchText ? scope.$alterations.disease.filter( filterFunction(searchText) ) : scope.$alterations.disease;
  };

  // Autocomplete Filter
  let filterFunction = (query) => {

    let lowerCaseQuery = angular.lowercase(query); // Prep input to lowercase

    // Return search function
    return (entry) => {
      return (entry.indexOf(lowerCaseQuery) > -1);
    }
  };

  // Check for pubmed entry if set
  scope.checkPMID = () => {

    // Disable loading bar
    scope.refLoading = false;

    if(scope.reference.id_type !== 'pubmed') return;
    if(scope.reference.ref_id === null || scope.reference.ref_id === '') return;

    // Define PubMed ID
    let pmid;

    pmid = scope.reference.ref_id.match(/^[0-9]{2,9}/)[0];

    // Show reference loading bar
    scope.refLoading = true;

    // Get PMID and process
    $pubmed.article(pmid).then(
      (article) => {
        scope.disableRefTitle = true;
        scope.reference.id_title = article.title;
        scope.reference.id_type = 'pubmed';
        scope.refLoading = false;
      },
      (err) => {
        console.log('Unable to retrieve PubMed Article: ', err);
      }
    );
  };

  // When the modal opens, watch for the events-expression value to load and validate it.
  scope.$watch('matching.events_expression', (newval, oldval) => {

    // Are we transitioning from an empty form to a prefilled?
    if((oldval === undefined || oldval === null) && (newval !== undefined && newval !== null)) {
      scope.validateKBEvents();
    } else {
      // If not, are we just looking at a normal typing change?
      if(scope.events.pristine) scope.validateKBEvents();
    }

    // If the previous value was null/undefined, mark as no longer pristine.
    if(newval !== null && newval !== undefined) scope.events.pristine = false;
  });

  // Auto-complete filter
  scope.disease.add = (entry) => {
    if(scope.disease.all === undefined) scope.disease.all = [];
    if(entry === null || entry === "") return;
    scope.disease.all.push(entry);
    scope.disease.new = null;
  };
  scope.disease.remove = (i) => {
    scope.disease.all.splice(i,1);
  };

  // Auto-complete filter
  scope.context.add = (entry) => {
    if(scope.context.all === undefined) scope.context.all = [];
    if(entry === null || entry === "") return;
    scope.context.all.push(entry);
    scope.context.new = null;
  };
  scope.context.remove = (i) => {
    scope.context.all.splice(i,1);
  };

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

  // Validate KB Events string
  scope.validateKBEvents = () => {
    scope.events.dirty = true;
    scope.events.valid = false;

    if(scope.reference.events_expression === '' || scope.reference.events_expression === undefined || scope.reference.events_expression === null) {
      scope.events.dirty = false;
      scope.events.valid = false;
      return;
    }

    // Try to validate
    $kb.validate.events(scope.reference.events_expression).then(
      (result) => {
        scope.events.dirty = false;
        scope.events.valid = true;
      },
      (err) => {
        scope.events.dirty = false;
        scope.events.valid = false;
      }
    )
  };

}]); // End controller
