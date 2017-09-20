app.controller('controller.dashboard.report.genomic.expressionAnalysis',
  ['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'ms', 'outliers', 'drugTargets', 'densityGraphs',
    (_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, ms, outliers, drugTargets, densityGraphs) => {
      
      // Load Images into template
      $scope.pog = pog;
      $scope.report = report;
      
      $scope.expOutliers = {};
      $scope.drugTargets = drugTargets;
      $scope.densityGraphs = _.chunk(_.values(densityGraphs),2);
      
      $scope.expSummaryMap = {
        clinical: 'Expression Level Outliers of Potential Clinical Relevance',
        nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
        biological: 'Expression Level Outliers of Biological Relevance',
      };
      
      $scope.mRNAOutliersMap = {
        upreg_onco: 'Up-Regulated Oncogenes',
        downreg_tsg: 'Down-Regulated Tumour Suppressor Genes'
      };
      // Convert full hex to 6chr
      $scope.colourHex = (hex) => {
        return hex.match(/([A-z0-9]{6}$)/)[0];
      };
      
      $scope.getPtxComparator = () => {
        
        if(outliers.length === 0) return {comparator: 'N/A', sumSamples: 0};
        
        let comparator = (outliers[0].ptxPercCol) ? outliers[0].ptxPercCol.substring(outliers[0].ptxPercCol.lastIndexOf("PTX_POG_")+8, outliers[0].ptxPercCol.lastIndexOf("_percentile")) : "N/A";
        
        return comparator;
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
          biological: [],
          upreg_onco: [],
          downreg_tsg: []
        };
        
        let typekey = 'outlierType';
        if(type === 'outlier') typekey = 'outlierType';
        
        // Run over mutations and group
        _.forEach(input, (row, k) => {
          if(!(row[typekey] in expressions)) expressions[row[typekey]] = [];
          // Add to type
          expressions[row[typekey]].push(row);
        });
        
        $scope.expOutliers = expressions;
        
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
