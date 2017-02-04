app.controller('controller.dashboard.report.genomic.detailedGenomicAnalysis', 
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'alterations', 'approvedThisCancer', 'approvedOtherCancer',
  (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, alterations, approvedThisCancer, approvedOtherCancer) => {
  
  $scope.approvedThisCancer = {};
  $scope.approvedOtherCancer = {};
  $scope.pog = pog;
  $scope.samples = [];
  $scope.alterations = {therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: null};
  
  // Filter reference type
  $scope.refType = (ref) => {
    if(ref.match(/^[0-9]{8}\#/)) {
      return 'pmid';
    }
    if(ref.match(/^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
      return 'link';
    } 
    return 'text';
  }
  
  // Prepend a link with http:// if necessary
  $scope.prependLink = (link) => {
    return (link.indexOf('http://') == -1) ? 'http://' + link : link;
  }
  
  // Clean up PMIDs
  $scope.cleanPMID = (pmid) => {
    return pmid.match(/^[0-9]{8}/)[0];
  }
  
  // Update entry icon clicked
  $scope.updateRow = ($event, row) => {
    
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
      clickOutToClose: false,
      locals: {
        gene: row,
        samples: $scope.samples,
        rowEvent: 'update',
      },
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
     
    }).then((outcome) => {
      if(outcome) $mdToast.show($mdToast.simple().textContent(outcome));
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }
  
  // Create new entry...
  $scope.createRow = ($event, section) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
      clickOutToClose: false,
      locals: {
        gene: null,
        samples: $scope.samples,
        rowEvent: 'create'
      },
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
    });
  }
  
  
  // Group Alterations
  let groupAlterations = (collection, alterations) => {
    
    alterations.forEach((row) => {
      
      // Does grouping exist?
      if(!(row.gene + '-' + row.variant in collection)) {
        row.children = [];
        return collection[row.gene + '-' + row.variant] = row; // Add row to collection
      }
      
      if(row.gene + '-' + row.variant in collection) return collection[row.gene + '-' + row.variant].children.push(row);
      
    });
    
    return _.values(collection);
    
  }
  
  // Setup Entries
  let groupEntries = (alterations) => {
    // Process the entries for grouping
    alterations.forEach((row) => {
       
      // Add to samples if not present
      if($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);
      
      // Grouping
      if(!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};
      
      // Check if it exists already?
      if(!(row.gene+'-'+row.variant in $scope.alterations[row.alterationType])) {
        row.children = [];
        return $scope.alterations[row.alterationType][row.gene+'-'+row.variant] = row;
      }
      
      // Categorical entry already exists
      if(row.gene+'-'+row.variant in $scope.alterations[row.alterationType]) {
        return $scope.alterations[row.alterationType][row.gene+'-'+row.variant]
          .children[$scope.alterations[row.alterationType][row.gene+'-'+row.variant].children.length] = row;
      }
      
    });
    
    _.forEach($scope.alterations, (values, k) => {
      $scope.alterations[k] = _.values(values);
      //console.log('Iteree: ', k, values, _.values(values));
    });
        
  }
  
  // Group Entries
  groupEntries(alterations);
  
  // Group Approved
  $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
  $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
    
}]);
