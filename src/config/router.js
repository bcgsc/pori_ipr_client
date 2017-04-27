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
				},
        "adminbar@dashboard": {
				  templateUrl: 'dashboard/adminbar/adminbar.html',
          controller: 'controller.dashboard.adminbar'
        }
			},
      data: {
			  displayName: 'Dashboard',
        breadcrumbProxy: 'dashboard.listing'
      },
			resolve: {
			  user: ['$q', 'api.session', '$state', '$userSettings', ($q, $session, $state, $userSettings) => {
			    return $q((resolve, reject) => {
			      // Attempt session initialization
			      $session.init().then(
			        (user) => {
                // Session init'd, return user
                $userSettings.init(); // Init settings
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
        isAdmin: ['$q', 'api.user', 'user', ($q, $user, user) => {
			    return $q((resolve, reject) => {
			      resolve($user.isAdmin());
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
      },
      resolve: {
        pogs: ['$q', 'api.pog', '$userSettings', 'user', ($q, $pog, $userSettings) => {
          let currentUserOnly = $userSettings.get('pogListCurrentUser');
          if(currentUserOnly === null || currentUserOnly === true) return $pog.all();
          if(currentUserOnly === false) return $pog.all({all:true});
        }]
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
        pog: ['_', '$q', '$stateParams', 'api.pog', 'user', (_, $q, $stateParams, $pog, user) => {
          return $q((resolve, reject) => {
            $pog.id($stateParams.POG).then(
              (pog) => {
                pog.myRoles = _.filter(pog.POGUsers, {user: {ident: user.ident}});
                resolve(pog);
              },
              (err) => {
                reject('Unable to load pog');
              }
            )
          })
        }]
      }
    })

    .state('dashboard.pog.report', {
      abstract: true,
      url: '/report',
      data: {
        displayName: "Reports",
        stateProxy: 'dashboard.pog.report.genomic.summary'
      },
			templateUrl: 'dashboard/report/report.html',
      resolve: {
        reports: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).all();
        }]
      }
    })

    .state('dashboard.pog.report.listing', {
      url: '/listing',
      data: {
        displayName: "Listing",
      },
			templateUrl: 'dashboard/report/listing/listing.html',
      controller: 'controller.dashboard.pog.report.listing',
    })

    .state('dashboard.pog.report.genomic', {
      url: '/{analysis_report}/genomic',
      data: {
        displayName: "Genomic",
        stateProxy: 'dashboard.pog.report.genomic.summary'
      },
      templateUrl: 'dashboard/report/genomic/genomic.html',
      controller: 'controller.dashboard.report.genomic',
      resolve: {
        report: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).get($stateParams.analysis_report);
        }]
      }
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
          return $gai.all($stateParams.POG, $stateParams.analysis_report);
        }],
        get: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
          return $get.all($stateParams.POG, $stateParams.analysis_report);
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        vc: ['$q', '$stateParams', 'api.summary.variantCounts', ($q, $stateParams, $vc) => {
          return $vc.get($stateParams.POG, $stateParams.analysis_report);
        }],
        pt: ['$q', '$stateParams', 'api.summary.probeTarget', ($q, $stateParams, $pt) => {
          return $pt.all($stateParams.POG, $stateParams.analysis_report);
        }],
        mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', ($q, $stateParams, $mutationSignature) => {
          return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
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
          return $comments.get($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.pog.report.genomic.pathwayAnalysis', {
      url: '/pathwayAnalysis',
      data: {
        displayName: "Pathway Analysis"
      },
      templateUrl: 'dashboard/report/genomic/pathwayAnalysis/pathwayAnalysis.html',
      controller: 'controller.dashboard.report.genomic.pathwayAnalysis',
      resolve: {
        pathway: ['$q', '$stateParams', 'api.summary.pathwayAnalysis', ($q, $stateParams, $pathway) => {
          return $pathway.get($stateParams.POG, $stateParams.analysis_report);
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
          return $APC.getAll($stateParams.POG, $stateParams.analysis_report);
        }],
        approvedThisCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
          return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
        }],
        approvedOtherCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
          return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
        }],
				targetedGenes: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.targetedGenes', ($q, $stateParams, $tg) => {
          return $tg.getAll($stateParams.POG, $stateParams.analysis_report);
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
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'subtypePlot.molecular,subtypePlot.receptorStatus');
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
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSummary.snv,mutSummary.indel,mutSummary.barSnv,mutSummary.barIndel,mutSignature.corPcors,mutSignature.snvsAllStrelka');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        smallMutations: ['$q', '$stateParams', 'api.somaticMutations.smallMutations', ($q, $stateParams, $smallMuts) => {
          return $smallMuts.all($stateParams.POG, $stateParams.analysis_report);
        }],
        mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', ($q, $stateParams, $mutationSignature) => {
          return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
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
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        cnvs: ['$q', '$stateParams', 'api.copyNumberAnalyses.cnv', ($q, $stateParams, $cnv) => {
          return $cnv.all($stateParams.POG, $stateParams.analysis_report);
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
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSummary.barSv,mutSummary.sv,circosSv.genome,circosSv.transcriptome');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        svs: ['$q', '$stateParams', 'api.structuralVariation.sv', ($q, $stateParams, $sv) => {
          return $sv.all($stateParams.POG, $stateParams.analysis_report);
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
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'expression.chart,expression.legend');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        outliers: ['$q', '$stateParams', 'api.expressionAnalysis.outlier', ($q, $stateParams, $outliers) => {
          return $outliers.all($stateParams.POG, $stateParams.analysis_report);
        }],
        drugTargets: ['$q', '$stateParams', 'api.expressionAnalysis.drugTarget', ($q, $stateParams, $drugTarget) => {
          return $drugTarget.all($stateParams.POG, $stateParams.analysis_report);
        }],
        densityGraphs: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.expDensityGraphs($stateParams.POG, $stateParams.analysis_report);
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
          return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.pog.report.genomic.meta', {
      url: '/meta',
      data: {
        displayName: "POG Meta Information"
      },
      templateUrl: 'dashboard/report/genomic/meta/meta.html',
      controller: 'controller.dashboard.report.genomic.meta',
    })

    .state('dashboard.pog.report.genomic.history', {
      url: '/history',
      data: {
        displayName: "Data History"
      },
      templateUrl: 'dashboard/report/genomic/history/history.html',
      controller: 'controller.dashboard.report.genomic.history',
      resolve: {
        history: ['$q', '$stateParams', 'api.pogDataHistory', ($q, $stateParams, $history) => {
          return $history($stateParams.POG).all();
        }],
        exports: ['$q', '$stateParams', 'api.pog', ($q, $stateParams, $pog) => {
          return $pog.export($stateParams.POG).all();
        }],
        tags: ['$q', '$stateParams', 'api.pogDataHistory', ($q, $stateParams, $history) => {
          return $history($stateParams.POG).tag.all();
        }]
      }
    })

    .state('dashboard.pog.report.genomic.therapeutic', {
      url: '/therapeutic',
      data: {
        displayName: "Potential Therapeutic Targets"
      },
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.html',
      controller: 'controller.dashboard.report.genomic.therapeutic',
      resolve: {
        therapeutic: ['$q', '$stateParams', 'api.therapeuticOptions', ($q, $stateParams, $therapeutic) => {
          return $therapeutic.all($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.admin', {
      url: '/admin',
      data: {
        displayName: 'Administration'
      },
      templateUrl: 'dashboard/admin/admin.html',
    })

    .state('dashboard.admin.users', {
      url: '/users',
      data: {
        displayName: 'Users & Groups',
        stateProxy: 'dashboard.admin.users.userList'
      },
      controller: 'controller.dashboard.admin.users',
      templateUrl: 'dashboard/admin/user/users.html',
      resolve: {
        users: ['$q', 'api.user', ($q, $user) => {
          return $user.all();
        }],
        groups: ['$q', 'api.user', ($q, $user) => {
          return $user.group.all();
        }]
      }
    })

    .state('dashboard.admin.users.userList', {
      url: '/userList',
      data: {
        displayName: 'Users'
      },
      controller: 'controller.dashboard.admin.users.userList',
      templateUrl: 'dashboard/admin/user/userList.html',
    })

    .state('dashboard.admin.users.groups', {
      url: '/groups',
      data: {
        displayName: 'Groups'
      },
      controller: 'controller.dashboard.admin.users.groups',
      templateUrl: 'dashboard/admin/user/group.html',
    })

    .state('print', {
      url: '/print',
      abstract: true,
      templateUrl: 'print/print.html',
      controller: 'controller.print',
      data: {
        displayName: 'Print'
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
      }
    })

    .state('print.POG', {
      url: '/POG/:POG',
      abstract: true,
      data: {
        displayName: '{{POG.POGID}}'
      },
      template: '<ui-view \\>',
      resolve: {
        pog: ['$q', '$stateParams', 'api.pog', ($q, $stateParams, $pog) => {
          return $pog.id($stateParams.POG);
        }]
      }
    })

    .state('print.POG.report', {
      url: '/report',
      abstract: true,
      template: '<ui-view \\>',
    })

    .state('print.POG.report.genomic', {
      url: '/genomic',
      data: {
        displayName: 'Genomic Report'
      },
      views: {
        "": {
          templateUrl: 'print/report/genomic/genomic.html',
          controller: 'controller.print.POG.report.genomic',
        },
        "summary@print.POG.report.genomic": { templateUrl: 'print/report/genomic/sections/summary/summary.html' },
      },
      resolve: {
        gai: ['$q', '$stateParams', 'api.summary.genomicAterationsIdentified', ($q, $stateParams, $gai) => {
          return $gai.all($stateParams.POG, $stateParams.analysis_report);
        }],
        get: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
          return $get.all($stateParams.POG, $stateParams.analysis_report);
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        vc: ['$q', '$stateParams', 'api.summary.variantCounts', ($q, $stateParams, $vc) => {
          return $vc.get($stateParams.POG, $stateParams.analysis_report);
        }],
        pt: ['$q', '$stateParams', 'api.summary.probeTarget', ($q, $stateParams, $pt) => {
          return $pt.all($stateParams.POG, $stateParams.analysis_report);
        }],
        mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', ($q, $stateParams, $mutationSignature) => {
          return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
        }],
        comments: ['$q', '$stateParams', 'api.summary.analystComments', ($q, $stateParams, $comments) => {
          return $comments.get($stateParams.POG, $stateParams.analysis_report);
        }],
        pathway: ['$q', '$stateParams', 'api.summary.pathwayAnalysis', ($q, $stateParams, $pathway) => {
          return $pathway.get($stateParams.POG, $stateParams.analysis_report);
        }],
        therapeutic: ['$q', '$stateParams', 'api.therapeuticOptions', ($q, $stateParams, $therapeutic) => {
          return $therapeutic.all($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.knowledgebase', {
      url: '/knowledgebase',
      abstract: true,
      data: {
        displayName: 'Dashboard',
        breadcrumbProxy: 'dashboard.knowledgebase.references'
      },
      controller: 'knowledgebase',
      templateUrl: 'dashboard/knowledgebase/knowledgebase.html'
    })

    .state('dashboard.knowledgebase.dashboard', {
      url: '/dashboard',
      data: {
        displayName: "Knowledgebase"
      },
      controller: 'knowledgebase.dashboard',
      templateUrl: 'dashboard/knowledgebase/dashboard/dashboard.html',
      resolve: {
        metrics: ['$q', 'api.knowledgebase', ($q, $kb) => {
          return $kb.metrics();
        }]
      }
    })

    .state('dashboard.knowledgebase.references', {
      url: '/references',
      data: {
        displayName: "References"
      },
      params: {
        filters: null
      },
      controller: 'knowledgebase.references',
      templateUrl: 'dashboard/knowledgebase/references/references.html',
      resolve: {
        references: ['$q', 'api.knowledgebase', '$stateParams', ($q, $kb, $stateParams) => {
          if($stateParams.filters) {
            return $kb.references.all(100, 0, $stateParams.filters);
          } else {
            return $kb.references.all(100, 0);
          }
        }],
        ref_count: ['$q', 'api.knowledgebase', '$stateParams',  ($q, $kb, $stateParams) => {
          if($stateParams.filters !== null) {
            return $kb.references.count($stateParams.filters);
          } else {
            return $kb.references.count();
          }
        }],
        vocabulary: ['$q', 'api.knowledgebase', ($q, $kb) => {
          return $kb.vocabulary();
        }]
      }
    })

    .state('dashboard.knowledgebase.events', {
      url: '/events',
      data: {
        displayName: "Events"
      },
      params: {
        filters: null
      },
      controller: 'knowledgebase.events',
      templateUrl: 'dashboard/knowledgebase/events/events.html',
      resolve: {
        events: ['$q', 'api.knowledgebase', '$stateParams', ($q, $kb, $stateParams) => {
          if($stateParams.filters) {
            return $kb.events.all(100, 0, $stateParams.filters);
          } else {
            return $kb.events.all(100, 0);
          }
        }],
        events_count: ['$q', 'api.knowledgebase', '$stateParams', ($q, $kb, $stateParams) => {
          if($stateParams.filters !== null) {
            return $kb.events.count($stateParams.filters);
          } else {
            return $kb.events.count();
          }
        }]
      }
    })

}]);
