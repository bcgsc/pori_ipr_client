app.config(['$locationProvider', '$urlRouterProvider', '$stateProvider', '$urlMatcherFactoryProvider', ($locationProvider, $urlRouterProvider, $stateProvider, $urlMatcherFactoryProvider) => {
	// Enable HTML5 mode for URL access
	$locationProvider.html5Mode(true); 
	
	// Don't require a perfect URL match (trailing slashes, etc)
	$urlMatcherFactoryProvider.strictMode(false);
	
	// If no path could be found, send user to 404 error
	$urlRouterProvider.otherwise(($injector, $location) => {
		$injector.get('$state').go('error.404', null, {location: false});
		return $location.path();
	});


	// Master State Provider
	// All states are defined and configured on this object
	$stateProvider
		
		// Default Public Entrance for Interactive-Pog-Report
		.state('public', {
			abstract: true,
			templateUrl: 'public/layout.html',
      resolve: {
			  _: ['$q', 'api.session', '$state', ($q, $session, $state) => {
			    return $q((resolve, reject) => {
			      $session.init().then(
			        (user) => {
			          if(user) $state.go('dashboard.listing');
			          reject('Already logged in');
              },
              (err) => {
			          resolve();
              }
            )
          });
        }]
      }
		})
		
		// Request access account for Interactive-Pog-Report
		.state('public.request', {
			url: '/request',
			templateUrl: 'public/request/request.html',
			controller: 'controller.public.request'
		})

		// Login to App
		.state('public.login', {
			url: '/login',
			templateUrl: 'public/login/login.html',
			controller: 'controller.public.login'
		})

		// Errors
		.state('error', {
			abstract: true,
			url: '/error',
			templateUrl: 'errors/error.html',
		})
		
		// 403 Error - Unauthorized Access
		.state('error.403', {
			url: '/403',
			templateUrl: 'errors/403.html'
		})
		
		// 404 Error - Resource Not Found
		.state('error.404', {
			url: '/404',
			templateUrl: 'errors/404.html'
		})
		
		// 500 Error - Server/API Error
		.state('error.500', {
			url: '/500',
			templateUrl: 'errors/500.html'
		})

    
		// Setup Dashboard state
		.state('dashboard', {
			abstract: true,
			views: {
				"@": {
					templateUrl: 'dashboard/dashboard.html',
					controller: 'controller.dashboard'
				},
				"toolbar@dashboard": {
					templateUrl: 'dashboard/toolbar.html',
					controller: 'controller.dashboard.toolbar'
				},
				"navigation@dashboard": {
				  templateUrl: 'dashboard/navigation.html',
				  controller: 'controller.dashboard.navigation'
				}
			},
      data: {
			  displayName: 'Dashboard',
        breadcrumbProxy: 'dashboard.listing'
      },
			resolve: {
			  user: ['$q', 'api.session', '$state', ($q, $session, $state) => {
			    return $q((resolve, reject) => {
			      // Attempt session initialization
			      $session.init().then(
			        (user) => {
			          // Session init'd, return user
			          resolve(user);
		          },
		          (err) => {
		            // No session, go to login page
		            $state.go('public.login');
		            reject(err);
	            }
				);
			      
		      });
		    }],
		    pogs: ['$q', 'api.pog', ($q, $pog) => {
		      return $q((resolve, reject) => {
		        $pog.all().then(
		          (pogs) => {
		            resolve(pogs);
	            },
	            (err) => {
	              console.log('[route.dashboard.pogAll]', err);
	              reject(err);
              }
		        );
		        
	        });
	      }]
		  }
		})
		
		// Dashboard Overview/POG Listing
		.state('dashboard.listing', {
			url: '/',
			templateUrl: 'dashboard/listing/listing.html',
			controller: 'controller.dashboard.listing',
      data: {
			  displayName: "Listing"
      }
		})
    
    .state('dashboard.listing.detail', {
      url: '/detail',
      templateUrl: 'dashboard/listing/detail.html',
      controller: 'controller.dashboard.listing.detail',
      data: {
        displayName: "Listing Detail"
      }
    })

    .state('dashboard.pog', {
      data: {
        displayName: '{{pog.POGID}}',
      },
      url: '/POG/{POG}',
      controller: 'controller.dashboard.pog',
      templateUrl: 'dashboard/pog/pog.html',
      resolve: {
        pog: ['$q', '$stateParams', 'api.pog', ($q, $stateParams, $pog) => {
          return $pog.id($stateParams.POG);
        }]
      }
    })

    .state('dashboard.pog.report', {
      url: '/report',
      abstract: true,
      data: {
        displayName: "Reports",
        breadcrumbProxy: 'dashboard.pog.report.genomic.summary'
      },
			templateUrl: 'dashboard/report/report.html',
    })

    .state('dashboard.pog.report.genomic', {
      url: '/genomic',
      data: {
        displayName: "Genomic"
      },
      templateUrl: 'dashboard/report/genomic/genomic.html',
      controller: 'controller.dashboard.report.genomic'
    })

    .state('dashboard.pog.report.genomic.summary', {
      url: '/summary',
      templateUrl: 'dashboard/report/genomic/summary/summary.html',
      controller: 'controller.dashboard.report.genomic.summary',
      data: {
        displayName: "Summary"
      },
      resolve: {
        gai: ['$q', '$stateParams', 'api.summary.genomicAterationsIdentified', ($q, $stateParams, $gai) => {
          return $gai.all($stateParams.POG);
        }],
        get: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
          return $get.all($stateParams.POG);
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG);
        }],
        vc: ['$q', '$stateParams', 'api.summary.variantCounts', ($q, $stateParams, $vc) => {
          return $vc.get($stateParams.POG);
        }],
        pt: ['$q', '$stateParams', 'api.summary.probeTarget', ($q, $stateParams, $pt) => {
          return $pt.all($stateParams.POG);
        }]
      }
    })


    .state('dashboard.pog.report.genomic.analystComments', {
      url: '/analystComments',
      data: {
        displayName: "Analyst Comments"
      },
      templateUrl: 'dashboard/report/genomic/analystComments/analystComments.html',
      controller: 'controller.dashboard.report.genomic.analystComments',
      resolve: {
        comments: ['$q', '$stateParams', 'api.summary.analystComments', ($q, $stateParams, $comments) => {
          return $comments.get($stateParams.POG);
        }]
      }
    })

    .state('dashboard.pog.report.genomic.detailedGenomicAnalysis', {
      url: '/detailedGenomicAnalysis',
      data: {
        displayName: "Detailed Genomic Analysis"
      },
      templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/detailedGenomicAnalysis.html',
      controller: 'controller.dashboard.report.genomic.detailedGenomicAnalysis',
      resolve: {
        alterations: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
          return $APC.getAll($stateParams.POG);
        }],
        approvedThisCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
          return $APC.getType($stateParams.POG, 'thisCancer');
        }],
        approvedOtherCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
          return $APC.getType($stateParams.POG, 'otherCancer');
        }],
				targetedGenes: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.targetedGenes', ($q, $stateParams, $tg) => {
          return $tg.getAll($stateParams.POG);
        }],
      }
    })

    .state('dashboard.pog.report.genomic.diseaseSpecificAnalysis', {
      url: '/diseaseSpecificAnalysis',
      data: {
        displayName: "Disease Specific Analysis"
      },
      templateUrl: 'dashboard/report/genomic/diseaseSpecificAnalysis/diseaseSpecificAnalysis.html',
      controller: 'controller.dashboard.report.genomic.diseaseSpecificAnalysis',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, 'subtypePlot.molecular,subtypePlot.receptorStatus');
        }]
      }
    })

    .state('dashboard.pog.report.genomic.somaticMutations', {
      url: '/somaticMutations',
      data: {
        displayName: "Somatic Mutations"
      },
      templateUrl: 'dashboard/report/genomic/somaticMutations/somaticMutations.html',
      controller: 'controller.dashboard.report.genomic.somaticMutations',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, 'mutSummary.snv,mutSummary.indel,mutSummary.barSnv,mutSummary.barIndel,mutSignature.corPcors,mutSignature.snvsAllStrelka');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG);
        }],
        smallMutations: ['$q', '$stateParams', 'api.somaticMutations.smallMutations', ($q, $stateParams, $smallMuts) => {
          return $smallMuts.all($stateParams.POG);
        }],
        mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', ($q, $stateParams, $mutationSignature) => {
          return $mutationSignature.all($stateParams.POG);
        }]
      }
    })

    .state('dashboard.pog.report.genomic.copyNumberAnalyses', {
      url: '/copyNumberAnalyses',
      data: {
        displayName: "Copy Number Analyses"
      },
      templateUrl: 'dashboard/report/genomic/copyNumberAnalyses/copyNumberAnalyses.html',
      controller: 'controller.dashboard.report.genomic.copyNumberAnalyses',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, 'cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG);
        }],
        cnvs: ['$q', '$stateParams', 'api.copyNumberAnalyses.cnv', ($q, $stateParams, $cnv) => {
          return $cnv.all($stateParams.POG);
        }]
      }
    })

    .state('dashboard.pog.report.genomic.structuralVariation', {
      url: '/structuralVariation',
      data: {
        displayName: "Structural Variation"
      },
      templateUrl: 'dashboard/report/genomic/structuralVariation/structuralVariation.html',
      controller: 'controller.dashboard.report.genomic.structuralVariation',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, 'mutSummary.barSv,mutSummary.sv,circosSv.genome,circosSv.transcriptome');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG);
        }],
        svs: ['$q', '$stateParams', 'api.structuralVariation.sv', ($q, $stateParams, $sv) => {
          return $sv.all($stateParams.POG);
        }]
      }
    })

    .state('dashboard.pog.report.genomic.expressionAnalysis', {
      url: '/expressionAnalysis',
      data: {
        displayName: "Expression Analysis"
      },
      templateUrl: 'dashboard/report/genomic/expressionAnalysis/expressionAnalysis.html',
      controller: 'controller.dashboard.report.genomic.expressionAnalysis',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, 'expression.chart,expression.legend');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG);
        }],
        outliers: ['$q', '$stateParams', 'api.expressionAnalysis.outlier', ($q, $stateParams, $outliers) => {
          return $outliers.all($stateParams.POG);
        }],
        drugTargets: ['$q', '$stateParams', 'api.expressionAnalysis.drugTarget', ($q, $stateParams, $drugTarget) => {
          return $drugTarget.all($stateParams.POG);
        }],
        densityGraphs: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.expDensityGraphs($stateParams.POG);
        }]
      }
    })

    .state('dashboard.pog.report.genomic.appendices', {
      url: '/appendices',
      data: {
        displayName: "Appendices"
      },
      templateUrl: 'dashboard/report/genomic/appendices/appendices.html',
      controller: 'controller.dashboard.report.genomic.appendices',
      resolve: {
        tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', ($q, $stateParams, $appendices) => {
          return $appendices.tcga($stateParams.POG);
        }]
      }
    })

}]);
