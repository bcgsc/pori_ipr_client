/**
 * Knowledgebase Utilities Factory
 *
 * Some basic functions for managing Knowledge utilities
 *
 */
app.service('$ticketBody', ['_', (_) => {
  
  
  return {
    processReferences: (references) => {
      let output = [];
      
      if(references.ident) references = [references];
      _.forEach(references, (r, k) => {
        // Build Events Expression Object
        let refs = {ors: [], ands: []};
        
        // Split by OR first
        if (r.events_expression.indexOf('|') > -1) {
          
          // Take each or block and blow it into "and" groups
          _.forEach(r.events_expression.split('|'), (orGroup, i) => {
            
            // Are there any "and" operators?
            if (orGroup.indexOf('&') > -1) {
              // Explode!
              refs.ors[i] = orGroup.split('&');
            } else {
              refs.ors[i] = [orGroup];
            }
            
          });
          
        } else if (r.events_expression.indexOf('&') > -1) {
          refs.ands = r.events_expression.split('&');
        } else {
          refs.ors[0] = [r.events_expression];
        }
        
        r.events_expression_expanded = refs;
        
        if(typeof r.disease_list === 'string') r.disease_list = r.disease_list.split(';');
        if(typeof r.context === 'string') r.context = r.context.split(';');
        
        // Add to array
        output.push(r);
        
      });
      
      return output;
    }
  }
  
}]);
