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
      
      // If it's an SV image, skip!
      if(img.filename.indexOf('_sv.') > -1) return;
      
      // Explode filename to extract comparator
      let pieces = img.key.split('.');
      
      // If no comparator in key, set to null
      img.comparator = pieces[2] || null;
      
      // If there's no comparator, and the file isn't an sv image, set the comparator to the value selected from tumour analysis (Backwards compatibility for v4.5.1 and older)
      if(!img.comparator) img.comparator = report.tumourAnalysis.diseaseExpressionComparator; // If no comparator found in image, likely legacy and use report setting.
      
      // Legend image
      if(img.filename.indexOf('legend') > -1 && img.filename.indexOf('snv_indel') > -1) return sorted.legend.snv_indel = img;
      
      // Set comparator to lowercase
      if(img.comparator.toLowerCase() && !_.find(sorted.comparators, {name: img.comparator.toLowerCase()})) sorted.comparators.push({name: img.comparator.toLowerCase(), visible: false});
      
      if(pieces[1].indexOf('barplot_indel') > -1 || pieces[1] === 'bar_indel') sorted.indel.barplot.push(img);
      if(pieces[1].indexOf('barplot_snv') > -1 || pieces[1] === 'bar_snv') sorted.snv.barplot.push(img);
      
      if(pieces[1].indexOf('density_plot_indel') > -1 || pieces[1] === 'indel') sorted.indel.densityPlot.push(img);
      if(pieces[1].indexOf('density_plot_snv') > -1 || pieces[1] === 'snv') sorted.snv.densityPlot.push(img);
      
    });
    
    console.log(sorted);
    
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
    
    //return _.find($scope.mutationSummaryImages[type][graph], {comparator: comparator});
    return _.find($scope.mutationSummaryImages[type][graph], (c) => {
      return (c.comparator.toLowerCase() === comparator.toLowerCase());
    });
    
  };
  
  
  processMutationSummaryImages(mutationSummaryImages);
  processMutations(smallMutations);
  pickCompatator();

}]);
