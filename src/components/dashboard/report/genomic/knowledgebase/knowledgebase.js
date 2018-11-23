
app.controller('controller.dashboard.report.genomic.knowledgebase', ['$rootScope', '_', '$q',
  '$scope', '$state', '$mdDialog', '$mdToast', '$acl', 'api.pog',
  'api.detailedGenomicAnalysis.alterations', 'pog', 'report', 'alterations', 'approvedThisCancer',
  'approvedOtherCancer', 'targetedGenes', '$async', ($rootScope, _, $q, $scope, $state, $mdDialog, $mdToast,
    $acl, $pog, $alterations, pog, report, alterations, approvedThisCancer, approvedOtherCancer,
    targetedGenes, $async) => {

    $scope.approvedThisCancer = [];
    $scope.approvedOtherCancer = [];
    $scope.pog = pog;
    $scope.report = report;
    $scope.samples = [];
    $scope.alterations = {
      therapeutic: [], prognostic: [], diagnostic: [], biological: [], unknown: [], novel: [],
    };
    $scope.targetedGenes = targetedGenes;
    $scope.loading = false;
    $scope.showCharacterizedAlterations = true;
    $scope.showUnknownAlterations = false;
    $scope.showNovelAlterations = false;

    // Edit permissions
    $scope.canEdit = false;
    if (!$acl.inGroup('clinician') && !$acl.inGroup('collaborator')) {
      $scope.canEdit = true;
    }

    // Create new entry...
    $scope.createNewKBEntry = ($event) => {
      const gene = {};

      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/report/genomic/knowledgebase/alterations/alterations.edit.html',
        clickOutToClose: false,
        locals: {
          pog: $scope.pog,
          gene: gene,
          samples: $scope.samples,
          rowEvent: 'new',
          report: report,
        },
        controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
      });
    };

    $scope.showAlterations = $async(async (alterationType) => {
      $scope.loading = true;
      // reset all sections to to disabled
      $scope.showCharacterizedAlterations = false;
      $scope.showUnknownAlterations = false;
      $scope.showNovelAlterations = false;

      switch (alterationType) {
        case 'unknown':
          $scope.showUnknownAlterations = true;
          break;
        case 'novel':
          $scope.showNovelAlterations = true;
          break;
        default:
          $scope.showCharacterizedAlterations = true;
          break;
      }
      $scope.loading = false;
    });

    $scope.showNoneFound = (alterationType) => {
      let showNoneFoundMessage = false;
      switch (alterationType) {
        case 'unknown':
          if ($scope.showUnknownAlterations) showNoneFoundMessage = true;
          break;
        case 'novel':
          if ($scope.showNovelAlterations) showNoneFoundMessage = true;
          break;
        default:
          if ($scope.showCharacterizedAlterations) showNoneFoundMessage = true;
          break;
      }
      return showNoneFoundMessage;
    };

    // Resort Groupings
    $scope.trigger = (val) => {
      if (val === false) return;

      // Loop over defined alterations
      _.forEach($scope.alterations, (v, k) => {
        // Loop over alterion type
        _.forEach(v, (row, rowID) => {
          // Is there a mismatch?
          if (row && row.alterationType !== k) {
            // Move to new alteration
            $scope.alterations[row.alterationType].unshift(row);

            $scope.alterations[k].splice(rowID, 1);
          }
        });
      });
    };
    // Filter reference type
    $scope.refType = (ref) => {
      if (ref.match(/^[0-9]{8}\#/)) {
        return 'pmid';
      }
      if (ref.match(/^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
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

    // Group approved alterations by type
    const groupAlterations = (collection, approvedAlterations) => {
      approvedAlterations.forEach((row) => {
        if (collection.length) {
          collection.forEach((entry, index) => {
            if ((entry.gene === row.gene) && (entry.variant === row.variant)) {
              row.children = [];
              collection.push(row); // Add row to collection
            } else {
              collection[index].children.push(row);
            }
          });
        } else {
          row.children = [];
          collection.push(row);
        }
      });
      return collection;
    };
    
    // Group Entries by Type
    const groupEntries = () => {
      // Process the entries for grouping
      alterations.forEach((row) => {
        // Add to samples if not present
        if ($scope.samples.includes(row.sample)) {
          $scope.samples.push(row.sample);
        }
        // Create new alteration type if it's not existing
        if (!(Object.prototype.hasOwnProperty.call($scope.alterations, row.alterationType))) {
          $scope.alterations[row.alterationType] = [];
        }
        // Check if it exists already?
        if ($scope.alterations[row.alterationType].length) {
          const match = $scope.alterations[row.alterationType].findIndex((entry) => {
            return ((entry.gene === row.gene) && (entry.variant === row.variant));
          });
          if (match > -1) {
            // Categorical entry already exists
            $scope.alterations[row.alterationType][match].children.push(row);
          } else {
            row.children = [];
            $scope.alterations[row.alterationType].push(row);
          }
        } else {
          row.children = [];
          $scope.alterations[row.alterationType].push(row);
        }
      });
    };
    // Group Entries
    groupEntries();
    // Group Approved
    $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
    $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
  }]);
