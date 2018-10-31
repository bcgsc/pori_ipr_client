app.controller('controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit', 
['_', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.pubmed', 'api.kb.associations', 'api.knowledgebase', 'api.user', '$interval', '$timeout', 'gene', 'rowEvent', 'samples', 'api.detailedGenomicAnalysis.alterations', 'pog', 'report',
(_, scope, $mdDialog, $mdToast, $complete, $pubmed, $kbAssoc, $kb, $user, $interval, $timeout, gene, rowEvent, samples, $dgaAPC, pog, report) => {
  
  scope.gene = angular.copy(gene);
  scope.samples = samples;
  scope.formAction = (rowEvent == 'update') ? 'Update' : 'Create';
  scope.$alterations = $complete.get('alterations');
  scope.disableRefTitle = false;
  scope.reference = {};
  scope.pog = pog;

  scope.requiredNew = !(rowEvent === 'new'); // For tagging ng-required on values that are optional for newly created entries.

  scope.stages = [
    {title: 'Report Details', description:'Details that appear in the report', id: "report"},
    {title: 'Reference Details', description: 'Specifics about the source', id: "reference"},
    {title: 'Knowledgebase Entry', description: 'KB database column values', id: "kb"}
  ];
  let activeStage = scope.activeStage = 0;

  scope.$knowledgebase = $complete.get('knowledgebase');
  scope.kb = {
    context: null,
    events_expression: (rowEvent === 'create') ? null : gene.kb_event_key,
    type: null,
    relevance: null,
    context: null,
    disease_list: null,
    evidence: null,
    id_type: null,
    id: null,
    id_title: null,
    status: 'new',
    summary: null,
    update_comments: null,
    comments: null,
    user: $user.meObj.username,
  };

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
      case 0:
        form = scope.reportForm;
        break;
      case 1:
        form = scope.referenceForm;
        break;
      case 2:
        form = scope.kbForm;
        break;
    }

    form.$setSubmitted();
    if(form.$valid) {
      scope.activeStage++;
    }
    if(!form.$valid) $mdToast.show($mdToast.simple({textContent:'Please check all the fields for errors'}));
  };

  scope.submit = () => {
    scope.kbForm.$setSubmitted();

    if(!scope.kbForm.$valid) $mdToast.show($mdToast.simple({textContent:'Please check all the fields for errors'}));

    // All are valid
    if(scope.kbForm.$valid) {

      // Remove gene children element from controller element
      delete scope.gene.children;

      scope.gene.kb_data = scope.kb;
      scope.gene.kb_data.id = scope.reference.type;
      scope.gene.kb_data.id_type = scope.gene.reference;
      scope.gene.kb_data.id_title = scope.reference.title;
      scope.gene.kb_data.evidence = scope.gene.evidence;
      scope.gene.kb_data.update_comments = scope.gene.comment;
      scope.gene.kb_data.summary = scope.reference.summary;

      console.log('submitting gene entry', scope.gene);
      // Send updated entry to API
      if(rowEvent === 'new') {
        $dgaAPC.one(scope.pog.POGID, report.ident, gene.ident).create(scope.gene).then(
          (result) => {
            $mdDialog.hide('Entry has been updated');
          },
          (error) => {
            alert('System Error - Unable to update. See console');
            console.log(error);
          }
        );
      } else {
        $dgaAPC.one(scope.pog.POGID, report.ident, gene.ident).update(scope.gene).then(
          (result) => {
            $mdDialog.hide('Entry has been updated');
          },
          (error) => {
            alert('System Error - Unable to update. See console');
            console.log(error);
          }
        );
      }

    }
  };

  // Watch Values and Build KB Entries
  scope.$watchGroup(['gene.variant_type', 'gene.gene', 'gene.kbVariant', 'gene.alterationType', 'gene.therapeuticContext', 'gene.disease', 'gene.evidence', 'gene.association'], (newVals, oldVals) => {
        
    scope.kb.events_expression = newVals[0] + '_' + newVals[1] + ':' + newVals[2];
    
    scope.kb.type = newVals[3];
    scope.kb.context = newVals[4];
    scope.kb.disease_list = newVals[5];
    scope.kb.evidence = newVals[6];
    scope.kb.relevance = newVals[7];
    
  });
  
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

  // Gene association
  scope.$watch('gene.association', (newVal, oldVal) => {

    let kbLookup = $kbAssoc.association(newVal);
    console.log('KBLookup result', kbLookup);
    if(kbLookup) {
      if(kbLookup == '*') {
        // Release Relevance Lock
        scope.relevanceLock=false;
        scope.gene.alterationType = null;
        return;
      }
      // Maintain Relevance Lock
      scope.relevanceLock=true;
      scope.gene.alterationType = kbLookup;
    }
    // No match found
    if(kbLookup === false) {
      scope.relevanceLock=false;
      scope.gene.alterationType = null;
      return;
    }

  });
  
  // Check for pubmed entry if set
  scope.checkPMID = () => {

    // Disable loading bar
    scope.refLoading = false;

    if(scope.gene.reference === '' || scope.gene.reference === undefined || scope.gene.reference.length === 0) {
      scope.disableRefTitle = false;
      scope.reference.title = "";
      scope.reference.type='other';
      return;
    }

    // Define PubMed ID
    let pmid;
    
    // Is this a PMID?
    if(!scope.gene.reference.match(/^[0-9]{5,8}(\#?)/)) {
      scope.disableRefTitle = false;
      scope.reference.title = "";
      scope.reference.type='other';
      return
    }
    
    pmid = scope.gene.reference.match(/^[0-9]{5,8}/)[0];
    
    // Show reference loading bar
    scope.refLoading = true;

    // Get PMID and process
    $pubmed.article(pmid).then(
      (article) => {
        scope.disableRefTitle = true;
        scope.reference.title = article.title;
        scope.reference.type = 'pubmed';
        scope.refLoading = false;
      },
      (err) => {
        console.log('Unable to retrieve PubMed Article: ', err);
      }
    );
  };

  // When the modal opens, watch for the events-expression value to load and validate it.
  scope.$watch('kb.events_expression', (newval, oldval) => {

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


  // Validate KB Events string
  scope.validateKBEvents = () => {
    scope.events.dirty = true;
    scope.events.valid = false;

    // Try to validate
    $kb.validate.events(scope.kb.events_expression).then(
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


  // Trigger Pubmed Check
  scope.checkPMID();
  
}]); // End controller
