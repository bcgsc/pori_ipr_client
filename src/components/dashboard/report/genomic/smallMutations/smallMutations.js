app.controller('controller.dashboard.report.genomic.smallMutations',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.somaticMutations.smallMutations', 'api.vardb', 'pog', 'report', 'ms', 'images', 'smallMutations', 'mutationSignature', 'mutationSummaryImages',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, $smallMutations, $vardb, pog, report, ms, images, smallMutations, mutationSignature, mutationSummaryImages) => {

  // Load Images into template
  $scope.images = images;
  $scope.pog = pog;
  $scope.report = report;
  $scope.smallMutations = {};
  $scope.mutationSignature = mutationSignature;
  $scope.ms = null;
  $scope.mutationSummaryImages = {};

  let processMutations = (muts) => {
    let mutations = {
      clinical: [],
      nostic: [],
      biological: [],
      unknown: []
    };

    // Run over mutations and group
    _.forEach(muts, (row, k) => {
      if(!(row.mutationType in mutations)) mutations[row.mutationType] = [];
      // Add to type
      mutations[row.mutationType].push(row);
    });

    // Set Small Mutations
    $scope.smallMutations = mutations;
  };
  
  let pickCompatator = () => {
    let search = _.find(ms, {comparator: report.tumourAnalysis.diseaseExpressionComparator});
    
    if(!search) search = _.find(ms, {comparator: 'average'});
    
    $scope.ms = search;
  };
  
  let processMutationSummaryImages = (images) => {
    
    let ssorted = {
      barplot: {
        indel: [],
        snv: [],
        sv: [],
      },
      densityPlot: {
        indel: [],
        snv: [],
        sv: [],
      },
      legend: {
        indel_snv: [],
        sv: [],
      }
    };
    
    let sorted = {
      comparators: [],
      indel: {
        barplot: [],
        densityPlot: [],
      },
      snv: {
        barplot: [],
        densityPlot: [],
      },
      sv: {
        barplot: [],
        densityPlot: []
      },
      legend: {
        snv_indel: [],
        sv: null
      }
    };
    
    _.forEach(images, (img) => {
      
      let pieces = img.key.split('.');
      img.comparator = pieces[2] || null;
      
      if(img.comparator && !_.find(sorted.comparators, {name: img.comparator})) sorted.comparators.push({name: img.comparator, visible: false});
      
      if(pieces[1].indexOf('barplot_indel') > -1) sorted.indel.barplot.push(img);
      if(pieces[1].indexOf('barplot_snv') > -1) sorted.snv.barplot.push(img);
      if(pieces[1].indexOf('barplot_sv') > -1) sorted.sv.barplot.push(img);
      
      if(pieces[1].indexOf('density_plot_indel') > -1) sorted.indel.densityPlot.push(img);
      if(pieces[1].indexOf('density_plot_snv') > -1) sorted.snv.densityPlot.push(img);
      if(pieces[1].indexOf('density_plot_sv') > -1) sorted.sv.densityPlot.push(img);
      
      if(pieces[1].indexOf('legend_snv_indel') > -1) sorted.legend.snv_indel.push(img);
      if(pieces[1].indexOf('legend_sv') > -1) sorted.legend.sv = img;
      
    });
    
    $scope.mutationSummaryImages = sorted;
    
  };
  
  
  /**
   * Retrieve specific mutation summary image
   *
   * @param {string} graph - The type of graph image to be retrieved (barplot, density graph, legend)
   * @param {string} type - The type of analysis (snv, indel, sv)
   * @param {string} comparator - OPTIONAL The comparator to be picked
   *
   * @returns
   */
  $scope.getMutationSummaryImage = (graph, type, comparator=null) => {
    
    return _.find($scope.mutationSummaryImages[type][graph], {comparator: comparator});
    
  };
  
  
  processMutationSummaryImages(mutationSummaryImages);
  processMutations(smallMutations);
  pickCompatator();

}]);
