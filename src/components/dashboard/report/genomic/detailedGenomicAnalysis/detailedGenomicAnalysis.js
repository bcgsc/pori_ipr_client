app.controller('controller.dashboard.report.genomic.detailedGenomicAnalysis', 
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.detailedGenomicAnalysis.alterations', 'pog', 'report', 'alterations', 'approvedThisCancer', 'approvedOtherCancer', 'targetedGenes',
  (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $alterations, pog, report, alterations, approvedThisCancer, approvedOtherCancer, targetedGenes) => {
  
  $scope.approvedThisCancer = {};
  $scope.approvedOtherCancer = {};
  $scope.pog = pog;
  $scope.report = report;
  $scope.samples = [];
  $scope.alterations = {therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: null};
  $scope.targetedGenes = targetedGenes;
  $scope.showUnknown = false;
  $scope.disableUnknownButtons = false;


  // Create new entry...
  $scope.createNewKBEntry = ($event) => {

    let gene = {};

    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
      clickOutToClose: false,
      locals: {
        pog: $scope.pog,
        gene: gene,
        samples: $scope.samples,
        rowEvent: 'new',
        report: report
      },
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
    });
  };

  // Toggle viewing unknowns state
  $scope.toggleUnknown = () => {

    $scope.disableUnknownButtons = true;

    // Show unknowns
    if(!$scope.showUnknown) {
      // First dump all alterations
      $scope.alterations = {therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: {}};

      // Load unknowns
      $alterations.getType(pog.POGID, 'unknown').then(
        (resp) => {
          groupEntries(resp);
          $scope.showUnknown = true;
          $scope.disableUnknownButtons = false;
        },
        (err) => {
          console.log('Unable to load unknowns', err);
        }
      );
    }

    // Show All others
    if($scope.showUnknown) {

      // First dump all alterations
      $scope.alterations = {therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: null};

      // Load unknowns
      $alterations.getAll(pog.POGID).then(
        (resp) => {
          groupEntries(resp);
          $scope.disableUnknownButtons = $scope.showUnknown = false;
        },
        (err) => {
          console.log('Unable to load unknowns', err);
        }
      );

    }

  };

  // Resort Groupings
  $scope.trigger = (val) => {
    if(val === false) return;

    // Loop over defined alterations
    _.forEach($scope.alterations, (v, k) => {
      // Loop over alterion type
      _.forEach(v, (row, rowID) => {
        // Is there a mismatch?
        if(row && row.alterationType !== k) {

          // Move to new alteration
          $scope.alterations[row.alterationType].unshift(row);

          $scope.alterations[k].splice(rowID,1);
        }

      });

    });

  };

  // Filter reference type
  $scope.refType = (ref) => {
    if(ref.match(/^[0-9]{8}\#/)) {
      return 'pmid';
    }
    if(ref.match(/^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
      return 'link';
    } 
    return 'text';
  };
  
  // Prepend a link with http:// if necessary
  $scope.prependLink = (link) => {
    return (link.indexOf('http://') == -1) ? 'http://' + link : link;
  };
  
  // Clean up PMIDs
  $scope.cleanPMID = (pmid) => {
    return pmid.match(/^[0-9]{8}/)[0];
  };

  // Group Alterations by type
  let groupAlterations = (collection, alterations) => {
    
    alterations.forEach((row) => {

      // Modify type

      // Does grouping exist?
      if(!(row.gene + '-' + row.variant in collection)) {
        row.children = [];
        return collection[row.gene + '-' + row.variant] = row; // Add row to collection
      }
      
      if(row.gene + '-' + row.variant in collection) return collection[row.gene + '-' + row.variant].children.push(row);
      
    });
    
    return _.values(collection);
    
  };
  
  // Group Entries by Type
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
        
  };
  
  // Group Entries
  groupEntries(alterations);
  
  // Group Approved
  $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
  $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
    
}]);
