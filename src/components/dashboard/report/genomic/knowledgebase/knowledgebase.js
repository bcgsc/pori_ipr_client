app.controller('controller.dashboard.report.genomic.knowledgebase',
  ['$rootScope', '_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', '$async', '$acl', 'api.pog', 'api.detailedGenomicAnalysis.alterations', 'pog', 'report', 'alterations', 'approvedThisCancer', 'approvedOtherCancer', 'targetedGenes',
    ($rootScope, _, $q, $scope, $state, $mdDialog, $mdToast, $async, $acl, $pog, $alterations, pog, report, alterations, approvedThisCancer, approvedOtherCancer, targetedGenes) => {
      $scope.approvedThisCancer = {};
      $scope.approvedOtherCancer = {};
      $scope.pog = pog;
      $scope.report = report;
      $scope.samples = [];
      $scope.alterations = {
        therapeutic: {},
        prognostic: {},
        diagnostic: {},
        biological: {},
        unknown: {},
        novel: {},
      };
      $scope.targetedGenes = targetedGenes;
      $scope.showUnknown = false;
      $scope.disableUnknownButtons = false;

      $scope.loading = false;
      $scope.showCharacterizedAlterations = true;
      $scope.showUnknownAlterations = false;
      $scope.showNovelAlterations = false;

      // Edit permissions
      $scope.canEdit = false;
      if (!$acl.inGroup('clinician') && !$acl.inGroup('collaborator')) {
        $scope.canEdit = true;
      }

      // Group Entries by Type
      const groupEntries = (alts) => {
        // Process the entries for grouping
        alts.forEach((row) => {
          // Add to samples if not present
          if ($scope.samples.indexOf(row.sample) === -1) $scope.samples.push(row.sample);
      
          // Grouping
          if (!(row.alterationType in $scope.alterations)) $scope.alterations[row.alterationType] = {};

          
          if (!(`${row.gene}-${row.variant}` in $scope.alterations[row.alterationType])) { // Check if it exists already?
            row.children = [];
            $scope.alterations[row.alterationType][`${row.gene}-${row.variant}`] = row;
          } else if (`${row.gene}-${row.variant}` in $scope.alterations[row.alterationType]) { // Categorical entry already exists
            $scope.alterations[row.alterationType][`${row.gene}-${row.variant}`]
              .children[$scope.alterations[row.alterationType][`${row.gene}-${row.variant}`].children.length] = row;
          }
        });
    
        _.forEach($scope.alterations, (values, k) => {
          $scope.alterations[k] = _.values(values);
        });
      };

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
          controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit', // End controller
        });
      };

      $scope.showAlterations = $async(async (alterationType) => {
        // Show loading in progress
        $scope.loading = true;

        // reset all sections to to disabled
        $scope.showCharacterizedAlterations = false;
        $scope.showUnknownAlterations = false;
        $scope.showNovelAlterations = false;

        // Dump all alterations
        $scope.alterations = {
          therapeutic: {},
          prognostic: {},
          diagnostic: {},
          biological: {},
          unknown: {},
          novel: {},
        };

        let alterationEntries;
        try {
          switch (alterationType) {
            case 'unknown':
              // Load unknown alterations
              alterationEntries = await $alterations.getType(pog.POGID, report.ident, 'unknown');
              $scope.showUnknownAlterations = true;
              break;
            case 'novel':
              // Load novel alterations
              alterationEntries = await $alterations.getType(pog.POGID, report.ident, 'novel');
              $scope.showNovelAlterations = true;
              break;
            default:
              // Default scenario is to load all characterized alterations
              alterationEntries = await $alterations.getAll(pog.POGID, report.ident);
              $scope.showCharacterizedAlterations = true;
              break;
          }
        } catch (err) {
          $mdToast.showSimple(`An error occured while loading ${alterationType} alterations`);
        }

        groupEntries(alterationEntries);
        $scope.loading = false; // finished loading
      });

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
        if (ref.match(/^[0-9]{8}#/)) {
          return 'pmid';
        }
        if (ref.match(/^(?:http(?:s)?:\/\/)?(?:[^.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
          return 'link';
        }
        return 'text';
      };
  
      // Prepend a link with http:// if necessary
      $scope.prependLink = (link) => {
        return (link.indexOf('http://') === -1) ? `http://${link}` : link;
      };
  
      // Clean up PMIDs
      $scope.cleanPMID = (pmid) => {
        return pmid.match(/^[0-9]{8}/)[0];
      };

      // Group Alterations by type
      const groupAlterations = (collection, alts) => {
        alts.forEach((row) => {
          // Modify type

          // Does grouping exist?
          if (!(`${row.gene}-${row.variant}` in collection)) {
            row.children = [];
            collection[`${row.gene}-${row.variant}`] = row; // Add row to collection
          } else if (`${row.gene}-${row.variant}` in collection) {
            collection[`${row.gene}-${row.variant}`].children.push(row);
          }
        });
    
        return _.values(collection);
      };
  
      // Group Entries
      groupEntries(alterations);
  
      // Group Approved
      $scope.approvedThisCancer = groupAlterations($scope.approvedThisCancer, approvedThisCancer);
      $scope.approvedOtherCancer = groupAlterations($scope.approvedOtherCancer, approvedOtherCancer);
    }]);
