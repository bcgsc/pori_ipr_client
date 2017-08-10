app.controller('controller.dashboard.report.genomic.expressionAnalysis',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'ms', 'outliers', 'drugTargets', 'densityGraphs',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, ms, outliers, drugTargets, densityGraphs) => {

      // Load Images into template
      $scope.pog = pog;
      $scope.report = report;
      $scope.expOutliers = {};
      $scope.drugTargets = drugTargets;
      $scope.densityGraphs = _.chunk(_.values(densityGraphs),2);

      $scope.titleMap = {
        clinical: 'Expression Level Outliers of Potential Clinical Relevance',
        nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
        biological: 'Expression Level Outliers of Biological Relevance',
      };

      // Convert full hex to 6chr
      $scope.colourHex = (hex) => {
        return hex.match(/([A-z0-9]{6}$)/)[0];
      };

      $scope.searchDrugs = (query) => {

        return (drug) => {
          if (!query) return true;
          // Rever to false return
          let result = false;

          // Gene Name
          if (drug.gene.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

          // LOH region
          if (drug.lohRegion.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

          // Drug Name
          if (drug.drugOptions.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;

          return result;

        };
      };

      // Sort outliers into categories
      let processOutliers = (outs) => {

        let outliers = {
          clinical: [],
          nostic: [],
          biological: []
        };

        // Run over mutations and group
        _.forEach(outs, (row, k) => {
          if(!(row.outlierType in outliers)) outliers[row.outlierType] = [];
          // Add to type
          outliers[row.outlierType].push(row);
        });

        // Set Small Mutations
        $scope.expOutliers = outliers;
      };

      processOutliers(outliers);

    }
  ]
);
