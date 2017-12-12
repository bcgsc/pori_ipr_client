app.controller('controller.dashboard.germline.report',
['$q', '_', '$scope', 'api.germline.report', 'api.germline.review', 'api.germline.variant', '$mdDialog', '$mdToast', 'report', 'user',
($q, _, $scope, $report, $review, $variant, $mdDialog, $mdToast, report, user) => {
  
  $scope.report = report;
  $scope.user = user;
  $scope.addReview = false;
  
  $scope.hasReview = (report, type) => {
    return (_.find(report.reviews, {type: type}) !== undefined) ? true : false;
  };
  
  $scope.show_extended = false;
  
  let tcga_comp = report.variants[0].tcga_comp || '[n/a]';
  let gtex_comp = report.variants[0].gtex_comp || '[n/a]';
  
  $scope.columns = {
    flagged: {
      name: 'Flagged',
      width: 100,
      show_always: true,
      split: ','
    },
    clinvar: {
      name: 'ClinVar',
      width: 100,
    },
    cgl_category: {
      name: 'CGL Category',
      width: 100,
      show_always: false
    },
    gmaf: {
      name: 'GMAF',
      width: 100,
      show_always: true
    },
    transcript: {
      name: 'Trancript',
      width: 100,
      show_always: true
    },
    gene: {
      name: 'Gene',
      width: 100,
      show_always: true
    },
    variant: {
      name: 'Variant',
      width: 100,
      show_always: true
    },
    impact: {
      name: 'Impact',
      width: 100,
      show_always: true
    },
    chromosome: {
      name: 'Chr',
      width: 40,
      show_always: true
    },
    position: {
      name: 'Pos',
      width: 100,
      show_always: true
    },
    dbSNP: {
      name: 'dbSNP',
      width: 100,
      show_always: true
    },
    reference: {
      name: 'Ref',
      width: 40,
      show_always: true
    },
    alteration: {
      name: 'Alt',
      width: 40,
      show_always: true
    },
    score: {
      name: 'Score',
      width: 50,
      show_always: true
    },
    zygosity_germline: {
      name: 'Zygosity in germline',
      width: 100,
      show_always: false
    },
    hgvs_cdna: {
      name: 'HGVS-cDNA',
      width: 100,
      show_always: false
    },
    hgvs_protein: {
      name: 'HGVS-protein',
      width: 100,
      show_always: false
    },
    zygosity_tumour: {
      name: 'Zygosity in tumour',
      width: 100,
      show_always: false
    },
    genomic_variant_reads: {
      name: 'Genomic variant reads ',
      tooltip: '(alt/total)',
      width: 120,
      show_always: false
    },
    rna_variant_reads: {
      name: 'RNA variant reads',
      tooltip: '(alt/total)',
      width: 120,
      show_always: false
    },
    gene_somatic_abberation: {
      name: 'Gene somatic aberration?',
      width: 100,
      show_always: false
    },
    notes: {
      name: 'Notes',
      width: 100,
      show_always: true
    },
    type: {
      name: 'Type',
      width: 100,
      show_always: true
    },
    patient_history: {
      name: 'Patient History',
      width: 100,
      show_always: true,
    },
    family_history: {
      name: 'Family History',
      width: 100,
      show_always: true
    },
    tcga_comp: {
      name: 'TCGA Comparator',
      width: 100,
      show_always: true
    },
    tcga_comp_average_percentile: {
      name: `tcga_comp_${tcga_comp}_percentile`,
      width: 100,
      show_always: true
    },
    tcga_comp_average_norm_percentile: {
      name: 'tcga_comp_average_norm_percentile',
      width: 100,
      show_always: true
    },
    tcga_comp_norm_percentile: {
      name: `tcga_comp_${tcga_comp}_norm_percentile`,
      width: 100,
      show_always: true
    },
    gtex_comp_average_percentile: {
      name: `tcga_comp_average_percentile`,
      width: 100,
      show_always: true
    },
    tcga_comp_percentile: {
      name: `tcga_comp_${tcga_comp}_percentile`,
      width: 100,
      show_always: true
    },
    gtex_comp: {
      name: 'GTex Comparator',
      width: 100,
      show_always: true
    },
    gtex_comp_percentile: {
      name: `gtex_comp_${gtex_comp}_average_percentile`,
      width: 100,
      show_always: true
    },
    fc_mean_bodymap: {
      name: 'fc_mean_bodymap',
      width: 100,
      show_always: true
    },
    fc_tissue: {
      name: 'fc_tissue',
      width: 100,
      show_always: true
    },
    fc_bodymap: {
      name: `fc_${gtex_comp}_bodymap`,
      width: 100,
      show_always: true
    },
    gene_expression_rpkm: {
      name: 'Gene Expression RPKM',
      width: 100,
      show_always: true
    },
    additional_info: {
      name: 'Additional Info',
      width: 100,
      show_always: false
    }
  };
  
  $scope.getHistory = ($ev, mode, v) => {
    
    let input = {
      value: v,
      mode: mode
    };
    
    if(mode === 'patient') input.name = input.placeholder = 'Patient History';
    if(mode === 'family') input.name = input.placeholder = 'Family History';
    
    $mdDialog.show({
      templateUrl: 'dashboard/germline/report/report.input.dialog.html',
      targetEvent: $ev,
      clickOutsideToClose: true,
      controller: ['scope', (scope) => {
        
        console.log('Inputs', input);
        
        scope.input = input;
        
        scope.cancel = () => {
          $mdDialog.cancel();
        };
        
        scope.submit = () => {
          $mdDialog.hide(input);
        };
        
      }]
    })
      .then((res) => {
      
        if(mode === 'patient') {
          _.forEach($scope.report.variants, (v, i) => {
            $scope.report.variants[i].patient_history = res.value;
          });
        }
        if(mode === 'family') {
          _.forEach($scope.report.variants, (v, i) => {
            $scope.report.variants[i].family_history = res.value;
          });
        }
  
        $q.all(_.map($scope.report.variants, (v) => {
            return $variant.update($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, v.ident, v);
          }))
          .then((result) => {
            console.log('Finished updating rows', result);
            $mdToast.showSimple('Report has been updated.');
          })
      
      
      })
      .catch((err) => {
      
      });
    
    
  };
  
  
  $scope.review = () => {
    
    let data = {
      type: $scope.new.type,
      comment: $scope.new.comment
    };
    
    $review.add($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, data)
      .then((review) => {
        $scope.report.reviews.push(review[0]);
        $mdToast.showSimple('The review has been added.');
        $scope.addReview = false;
      })
      .catch((err) => {
        $mdToast.showSimple('Failed to add the submitted reviewed.');
      })
    
  };
  
  $scope.toggleVariantHidden = (variant) => {
    
    variant.hidden = !variant.hidden;
    
    $variant.update($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, variant.ident, variant)
      .then((result) => {
        // Update report in memory with fresh result from API.
        let i = _.find($scope.report.variants, {ident: result.ident});
        $scope.report.variants[i] = result;
      })
      .catch((e) => {
        console.log('Hide error', e);
        $mdToast.showSimple('Failed to update variant with visibility change');
      });
    
  };
  
  
  $scope.removeReview = (review) => {
    
    $review.remove($scope.report.analysis.pog.POGID, $scope.report.analysis.analysis_biopsy, $scope.report.ident, review.ident)
      .then((res) =>{
        $scope.report.reviews.splice(_.find($scope.report.reviews, {ident: review.ident}, 1));
      })
      .catch((e) => {
        console.log('Response: ', e);
        $mdToast.showSimple('Failed to remove the requested review');
      })
  }
  
}]);