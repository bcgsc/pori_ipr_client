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
      let processExpression = (input, type) => {
        
        let expressions = {
          clinical: [],
          nostic: [],
          biological: []
        };
        
        let typekey = 'outlierType';
        if(type === 'outlier') typekey = 'outlierType';
        
        // Run over mutations and group
        _.forEach(input, (row, k) => {
          if(!(row[typekey] in expressions)) expressions[row[typekey]] = [];
          // Add to type
          expressions[row[typekey]].push(row);
        });
        
        // Set Small Mutations
        
        if(type === 'outlier') $scope.expOutliers = expressions;
        if(type === 'protein') $scope.expProtein = expressions;
        
      };
      
      let processGraphs = () => {
        
        let graphs = {};
        
        _.forEach(densityGraphs, (graph) => {
          let gene = graph.filename.split('.')[0];
          graphs[gene] = graph;
        });
        
        $scope.densityGraphs = graphs;
        
      };
      
      processGraphs();
      processExpression(outliers, 'outlier');
      
    }
  ]
);
