app.controller('controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit', 
  ['_', '$scope', '$mdDialog', 'api.complete', 'api.pubmed', 'gene', 'rowEvent', 'samples', (_, scope, $mdDialog, $complete, $pubmed, gene, rowEvent, samples) => {
  
  scope.gene = (rowEvent == 'create') ? {reference: '', gene: '', variant: '', variant_type: ''} : gene;
  scope.samples = samples;
  scope.formAction = (rowEvent == 'update') ? 'Update' : 'Create';
  scope.$alterations = $complete.get('alterations');
  scope.disableRefTitle = false;
  scope.reference = {};
  scope.kb = {}
  
  // Watch Values and Build KB Entries
  scope.$watchGroup(['gene.variant_type', 'gene.gene', 'gene.variant', 'gene.alterationType', 'gene.therapeuticContext', 'gene.disease', 'gene.evidence', 'gene.association'], (newVals, oldVals) => {
        
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
  }
  
  // Filter Auto-compelte for relevances
  scope.findRelevance = (searchText) => {
    return searchText ? scope.$alterations.association.filter( filterFunction(searchText) ) : scope.$alterations.association; 
  }
  
  
  // Filter Auto-compelte for relevances
  scope.findDisease = (searchText) => {
    return searchText ? scope.$alterations.disease.filter( filterFunction(searchText) ) : scope.$alterations.disease; 
  }
  
  // Autocomplete Filter
  let filterFunction = (query) => {
    
    let lowerCaseQuery = angular.lowercase(query); // Prep input to lowercase
    
    // Return search function
    return (entry) => {            
      return (entry.indexOf(lowerCaseQuery) > -1);
    }
  }
  
  // Check for pubmed entry if set
  scope.checkPMID = () => {
    
    if(scope.gene.reference === '' || scope.gene.reference === undefined || scope.gene.reference.length === 0) {
      console.log('No reference found...');
      scope.disableRefTitle = false;
      scope.reference.title = "";
      scope.reference.type='other';
      return;
    }
    let pmid;
    
    // Is this a PMID?
    if(!scope.gene.reference.match(/^[0-9]{5,8}(\#?)/)) {
      scope.disableRefTitle = false;
      scope.reference.title = "";
      scope.reference.type='other';
      return
    }
    
    pmid = scope.gene.reference.match(/^[0-9]{5,8}/)[0];
    
    
    // Get PMID and process
    $pubmed.article(pmid).then(
      (article) => {
        console.log('Retrieved PubMed artcile: ', article);
        scope.disableRefTitle = true;
        scope.reference.title = article.title;
        scope.reference.type = 'pubmed';
      },
      (err) => {
        console.log('Unable to retrieve PubMed Article: ', err);
      }
    );
    
  }
  
  // Update the specified entry
  scope.update = (f) => {
    
    // Check for valid inputs by touching each entry
    if(f.$invalid) {
      f.$setDirty();
      angular.forEach(f.$error, (field) => {
        angular.forEach(field, (errorField) => {
          errorField.$setTouched();
        });
      });
      return;
    }
    
    // Send updated entry to API
    $dgaAPC.one($scope.pog.POGID, gene.ident).update(scope.gene).then(
      (result) => {
        $mdDialog.hide('Entry has been updated');
      },
      (error) => {
        alert('Unable to update. See console');
        console.log(error);
      }
    );
    
  } // End update
  
  // Trigger Pubmed Check
  scope.checkPMID();
  
}]) // End controller
