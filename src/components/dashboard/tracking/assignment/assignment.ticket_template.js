app.controller('controller.dashboard.tracking.ticket_template',
['$rootScope', '$scope', '$q', '_', '$mdToast', 'api.tracking.ticket_template', 'api.jira', 'definition', 'templates',
($rootScope, $scope, $q, _, $mdToast, $template, $jira, definition, templates) => {
  
  $scope.definition = definition;
  $scope.templates = templates;
  $scope.editing = {};
  
  $scope.variables = [
    { name: 'Patient ID', tag: 'patient' },
    { name: 'Patient Sex', tag: 'sex' },
    { name: 'Patient Age', tag: 'age' },
    { name: 'Normal Library', tag: 'lib_normal' },
    { name: 'Tumour Library', tag: 'lib_tumour' },
    { name: 'Tumour Pool', tag: 'pool_tumour' },
    { name: 'RNA Library', tag: 'lib_rna' },
    { name: 'RNA Pool', tag: 'pool_rna' },
    { name: 'Disease', tag: 'disease' },
    { name: 'Biopsy Notes', tag: 'biopsy_notes' },
    { name: 'BioApps Biop#', tag: 'biop' },
    { name: 'Num lanes Seq\'d', tag: 'num_lanes' },
    { name: 'Sequencer', tag: 'sequencer' },
    { name: 'Priority', tag: 'priority' },
    { name: 'Presenter', tag: 'presenter' },
    { name: 'BioFXician', tag: 'biofxician' },
    { name: 'Analysis Due', tag: 'analysisis_due' },
    //{ name: 'BioFX Due', tag: 'biofx_due' },
  ];
  
  $scope.insertVar = (v) => {
    $rootScope.$broadcast('insertText', '{{'+v+'}}');
  };
  
  /**
   * Select an existing template to modify
   *
   * @param {object} template - Load template into form for editing
   */
  $scope.selectTemplate = (template) => {
    $scope.editing = template;
    $scope.editing.new = false;
    
    if(template.security === 10010) $scope.editing.pog_restricted = true;
    
    $scope.getProject(template.project);
  };
  
  /**
   * Setup form to create new template
   *
   */
  $scope.newTemplate = () => {
    $scope.editing = { name: null, new:true, body: "", tags: [] };
  };
  
  /**
   * Cancel editing
   *
   */
  $scope.cancelEditing = () => {
    $scope.editing = {};
    $mdToast.show($mdToast.simple().textContent('No changes have been saved.'));
  };
  
  /**
   * Search JIRA project namespaces
   *
   * @param searchText
   * @returns {Promise}
   */
  $scope.searchProjects = (searchText) => {
    return $q((resolve, reject) => {
      if(searchText.length === 0) return [];
      
      $jira.projects.all(searchText)
        .then((resp) => {
          resolve(_.filter(resp, (r) => { if(r.key.toLowerCase().indexOf(searchText.toLowerCase()) > -1 || r.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ) return r; }));
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  };
  
  /**
   * Get Components
   *
   */
  $scope.getProject = () => {
    
    if($scope.editing.project === undefined || $scope.editing.project === null) {
      return [];
    }
    
    if(!$scope.editing.components) $scope.editing.components = [];
    
    let projectKey = null;
    
    if(typeof $scope.editing.project === 'object') projectKey = $scope.editing.project.key;
    if(typeof $scope.editing.project === 'string') projectKey = $scope.editing.project;
    
    $jira.projects.get(projectKey)
      .then((project) => {
        $scope.components = project.components;
        $scope.issueTypes = project.issueTypes;
      })
      .catch((err) => {
        console.log('Failed to retrieve components', err);
      });
    
    $jira.priority()
      .then((priorities) => {
        $scope.priorities = priorities;
      })
      .catch((err) => {
        console.log('Failed to retrieve ticket priorities', err);
      });
    
    /*
      !! This endpoint does not support CORS retrieval.
    $jira.projects.getSecurityLevels($scope.editing.project.id)
      .then((levels) => {
        // Check for POG-Restricted security level
        let found = _.find(levels, {name: 'POG Restricted'});
        
        $scope.pogRestricted = (found);
        console.log('The project has a secured setting?', $scope.pogRestricted);
        
      })
      .catch((err) => {
      
      });
    */
  };
  
  
  $scope.removeTemplate = () => {
    
    // If it's never been persisted, clear the form.
    if($scope.editing.new) {
      $scope.editing = {};
      return;
    }
    
    $template.remove(definition.ident, $scope.editing.ident)
      .then((res) => {
        
        // Find and remove entry
        let i = _.findIndex($scope.templates, {ident: $scope.editing.ident});
        delete $scope.templates[i];
        templates = $scope.templates;
        
        // Reset Form
        $scope.editing = {};
      
      })
      .catch((err) => {
      
      });
    
  };
  
  
  $scope.save = (f) => {
    console.log('Submitted form', f, $scope.editing);
    
    // Remap Project Key
    if(typeof $scope.editing.project === 'object' && $scope.editing.project.key) $scope.editing.project = $scope.editing.project.key;
    if(typeof $scope.editing.project !== 'string') return $mdToast.showSimple('There was a problem with the project name.');
    
    if($scope.editing.pog_restricted) $scope.editing.security = 10010;
    
    if($scope.editing.new) {
  
      $template.create(definition.ident, $scope.editing)
        .then((template) => {
          $scope.templates.push(template);
          $scope.editing = {};
          $mdToast.showSimple('The ticket template has been saved.');
        })
        .catch((err) => {
          $mdToast.showSimple('Failed to save the ticket template.');
        });
    }
    
    if(!$scope.editing.new) {
    
      $template.update(definition.ident, $scope.editing)
        .then((template) => {
          // Find existing and replace
          let i = _.findIndex($scope.templates, {ident: template.ident});
  
          $scope.templates[i] = template;
          templates = $scope.templates;
  
          $mdToast.showSimple('The ticket template has been saved.');
        })
        .catch((err) => {
          $mdToast.showSimple('Failed to save the ticket template.');
        });
      
    }
  }
  
}]);