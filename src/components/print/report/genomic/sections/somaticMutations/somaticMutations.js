app.controller('controller.print.POG.report.genomic.somaticMutations',
['_', '$scope', '$sce', 'pog', 'report', 'images', 'ms', 'smallMutations', 'mutationSignature', 'mutationSummaryImages',
(_, $scope, $sce, pog, report, images, ms, smallMutations, mutationSignature, mutationSummaryImages) => {

  // Data
  $scope.report = report;
  $scope.pog = pog;
  $scope.images = images;
  $scope.smallMutations = {};
  $scope.mutationSignature = [];
  $scope.nnlsNormal = false;
  $scope.ms = null;

  $scope.copyFilter = (copyChange) => {
    const parsed = _.parseInt(copyChange);
    if (isNaN(parsed)) {
      return copyChange;
    }
    return parsed;
  };

  let processSignature = (sigs) => {
    $scope.mutationSignature = [];
    let nnlsMax = ($scope.nnlsNormal) ? 0 : 1;

    _.forEach(sigs, (r, k) => {
      if(r.nnls > nnlsMax) nnlsMax = r.nnls;
    });

    _.forEach(sigs, (r, k) => {

      // Round to 3 sigfigs
      r.pearson = r.pearson.toFixed(3);
      r.nnls = r.nnls.toFixed(3);

      // Produced rounded numbers
      r.pearsonColour = Math.round((((r.pearson < 0) ? 0 : r.pearson)  * 100) / 5) * 5;
      r.nnlsColour = Math.round(((r.nnls/nnlsMax) * 100) / 5) * 5;

      $scope.mutationSignature.push(r);

    });

  };

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
  
  
  processMutationSummaryImages(mutationSummaryImages);
  processMutations(smallMutations);
  pickCompatator();
  
  processMutations(smallMutations);
  processSignature(angular.copy(mutationSignature));

}]);