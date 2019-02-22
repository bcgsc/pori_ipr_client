app.controller('controller.dashboard.report.genomic.structuralVariation',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'pog', 'report', 'images', 'svs', 'ms', 'mutationSummaryImages', 'mavisSummary',
(_, $q, $scope, $state, $mdDialog, $mdToast, $pog, pog, report, images, svs, ms, mutationSummaryImages, mavisSummary) => {

  // Load Images into template
  $scope.images = images;
  $scope.pog = pog;
  $scope.report = report;
  $scope.ms = ms;
  $scope.StrucVars = {};
  
  let pickCompatator = () => {
    let search = _.find(ms, {comparator: report.tumourAnalysis.diseaseExpressionComparator});
    
    if(!search) search = _.find(ms, {comparator: 'average'});
    
    $scope.ms = search;
  };
  
  $scope.titleMap = {
    clinical: 'Gene Fusions of Potential Clinical Relevance',
    nostic: 'Gene Fusions of Prognostic and Diagnostic Relevance',
    biological: 'Gene Fusions with Biological Relevance',
    fusionOmicSupport: 'Gene Fusions with Genome and Transcriptome Support',
    uncharacterized: 'Uncharacterized Gene Fusions',
  };

  let processMutationSummaryImages = (images) => {
    
    let sorted = {
      comparators: [],
      sv: {
        barplot: [],
        densityPlot: []
      },
      legend: {
        sv: null
      }
    };
    
    _.forEach(images, (img) => {
      
      if(img.key.indexOf('sv') === -1) return;
  
      let pieces = img.key.split('.');
      img.comparator = pieces[2] || null;
      if(!img.comparator) img.comparator = report.tumourAnalysis.diseaseExpressionComparator; // If no comparator found in image, likely legacy and use report setting.
  
      if(img.comparator.toLowerCase() && !_.find(sorted.comparators, {name: img.comparator.toLowerCase()})) sorted.comparators.push({name: img.comparator.toLowerCase(), visible: false});
  
      if(pieces[1].indexOf('barplot_sv') > -1 || pieces[1] === 'bar_sv') sorted.sv.barplot.push(img);
      if(pieces[1].indexOf('density_plot_sv') > -1 || pieces[1] === 'sv') sorted.sv.densityPlot.push(img);
      
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
    
    if(comparator === null) {
      let img = $scope.mutationSummaryImages[type][graph];
      if(img && img.length === 1) return img[0];
    }
    return _.find($scope.mutationSummaryImages[type][graph], (c) => {
      return (c.comparator.toLowerCase() === comparator.toLowerCase());
    });

  };
  
  
  let processSvs = (structVars) => {
    console.log(structVars);

    let svs = {
      clinical: [],
      nostic: [],
      biological: [],
      fusionOmicSupport: [],
      uncharacterized: [],
    };

    // Run over mutations and group
    _.forEach(structVars, (row, k) => {
      // append mavis summary to row if it has a mavis_product_id
      let sv = row;

      if(row.mavis_product_id) {
        _.assign(sv, sv, JSON.parse(_.find(mavisSummary, {product_id: sv.mavis_product_id}).summary));
      }

      // setting fields to omit from details viewer
      sv = _.omit(sv, ['mavis_product_id']);

      if(!(sv.svVariant in svs)) svs[sv.svVariant] = [];
      // Add to type
      svs[sv.svVariant].push(sv);
    });

    // Set Small Mutations
    $scope.StrucVars = svs;
  };

  processSvs(svs);
  pickCompatator();
  processMutationSummaryImages(mutationSummaryImages);

}]);
