app.controller('controller.print.POG.report.genomic.dga',
['_', '$scope', 'pog', 'report', 'alterations', 'approvedThisCancer', 'approvedOtherCancer', 'targetedGenes', 'unknownAlterations',
(_, $scope, pog, report, alterations, approvedThisCancer, approvedOtherCancer, targetedGenes, unknownAlterations) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.samples = [];
  $scope.alterations = {therapeutic: {}, prognostic: {}, diagnostic: {}, biological: {}, unknown: {}};
  $scope.approvedThisCancer = {};
  $scope.approvedOtherCancer= {};

  alterations = alterations.concat(unknownAlterations);

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