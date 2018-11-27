app.controller('controller.print.POG.report.genomic.structuralVariants',
['_', '$scope', '$sce', 'pog', 'report', 'structuralVariantImages', 'ms', 'svs', 'mutationSummaryImages',
(_, $scope, $sce, pog, report, structuralVariantImages, ms, svs, mutationSummaryImages) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = structuralVariantImages;
  $scope.ms = ms;
  $scope.allVariants = [];

  $scope.titleMap = {
    clinical: 'Gene Fusions of Potential Clinical Relevance',
    nostic: 'Gene Fusions of Prognostic and Diagnostic Relevance',
    biological: 'Gene Fusions with Biological Relevance',
    fusionOmicSupport: 'Gene Fusions with Genome and Transcriptome Support'
  };

  let processSvs = (structVars) => {

    let svs = {
      clinical: [],
      nostic: [],
      biological: [],
      fusionOmicSupport: []
    };

    // Run over mutations and group
    _.forEach(structVars, (row, k) => {
      if(!(row.svVariant in svs)) svs[row.svVariant] = [];
      row.breakpoint = _.join(row.breakpoint.split('|'), '| ');
      // Add to type
      svs[row.svVariant].push(row);

      row.svg = $sce.trustAsHtml(row.svg);
      $scope.allVariants.push(row);
    });

    // Set Small Mutations
    $scope.StrucVars = svs;
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
      if(!img.comparator) img.comparator = report.tumourAnalysis.diseaseExpressionComparator; // If no comparator found in image, likely legacy and use report setting.
  
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

  processSvs(svs);
  pickCompatator();
  processMutationSummaryImages(mutationSummaryImages);

}]);