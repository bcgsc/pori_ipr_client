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
			          if(user) $state.go('dashboard.reports');
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
        "adminbar@dashboard": {
				  templateUrl: 'dashboard/adminbar/adminbar.html',
          controller: 'controller.dashboard.adminbar'
        }
			},
      data: {
			  displayName: 'Dashboard',
        breadcrumbProxy: 'dashboard.reports'
      },
			resolve: {
			  user: ['$q', 'api.session', '$state', '$userSettings', 'api.socket', ($q, $session, $state, $userSettings, socket) => {
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
	              reject(err);
              }
		        );

	        });
	      }],
        projects: ['api.project', ($project) => {
			    return $project.all();
        }]
		  }
		})

    .state('dashboard.home', {
      url: '/',
      templateUrl: 'dashboard/home/home.html',
      controller: 'controller.dashboard.home',
    })

		// Dashboard Overview/POG Listing
		.state('dashboard.reports', {
		  abstract: true,
			url: '/reports',
      templateUrl: 'dashboard/reports/reports.html',
      data: {
        displayName: 'Reports',
        breadcrumbProxy: 'dashboard.reports.dashboard'
      }
		})

    .state('dashboard.reports.dashboard', {
      url: '/dashboard',
      templateUrl: 'dashboard/reports/dashboard/dashboard.html',
      controller: 'controller.dashboard.reports.dashboard',
      data: {
        displayName: 'Listing',
        breadcrumbProxy: ($state) => {
          if($state.current.name.indexOf('report.probe') > -1) return 'dashboard.reports.probe';
          if($state.current.name.indexOf('report.genomic') > -1) return 'dashboard.reports.genomic';
          return 'dashboard.reports.dashboard';
        }
      },
      resolve: {
        reports: ['$q', 'api.pog_analysis_report', ($q, $report) => {
          return $report.all({states: 'ready,active'});
        }]
      }
    })

    .state('dashboard.reports.genomic', {
      url: '/genomic',
      templateUrl: 'dashboard/reports/genomic/genomic.html',
      controller: 'controller.dashboard.reports.genomic',
      data: {
        displayName: 'Genomic Reports'
      },
      resolve: {
        reports: ['$q', 'api.pog_analysis_report', '$userSettings', 'user', ($q, $report, $userSettings) => {
          let currentUser = $userSettings.get('genomicReportListCurrentUser');
          let project = $userSettings.get('selectedProject') || undefined;
          if(currentUser === null || currentUser === undefined || currentUser === true) return $report.all({type: 'genomic', states: 'ready,active,presented', project: project});
          if(currentUser === false) return $report.all({all:true, type: 'genomic', states: 'ready,active,presented', project: project});
        }]
      }
    })
    .state('dashboard.reports.probe', {
      url: '/probe',
      templateUrl: 'dashboard/reports/probe/probe.html',
      controller: 'controller.dashboard.reports.probe',
      data: {
        displayName: 'Probe Reports'
      },
      resolve: {
        reports: ['$q', 'api.pog_analysis_report', '$userSettings', 'user', ($q, $report, $userSettings) => {
          let currentUser = $userSettings.get('probeReportListCurrentUser');
          if(currentUser === null || currentUser === undefined || currentUser === true) return $report.all({type: 'probe', states: 'uploaded,signedoff'});
          if(currentUser === false) return $report.all({all:true, type: 'probe', states: 'uploaded,signedoff'});
        }]
      }
    })

    .state('dashboard.reports.pog', {
      data: {
        displayName: '{{pog.POGID}}',
        breadcrumbProxy: 'dashboard.reports.pog.report.listing'
      },
      url: '/'+CONFIG.PROJECT.NAME+'/{POG}',
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

    .state('dashboard.reports.pog.report', {
      abstract: true,
      url: '/report',
      data: {
        displayName: "Analysis Reports",
        breadcrumbProxy: 'dashboard.reports.pog.report.listing'
      },
			templateUrl: 'dashboard/report/report.html',
      resolve: {
        reports: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).all();
        }]
      }
    })

    .state('dashboard.reports.pog.report.listing', {
      url: '/listing',
      data: {
        displayName: "Analysis Reports",
      },
			templateUrl: 'dashboard/report/listing/listing.html',
      controller: 'controller.dashboard.pog.report.listing',
    })


    /**
     * Probing
     *
     */
    .state('dashboard.reports.pog.report.probe', {
      url: '/{analysis_report}/probe',
      data: {
        displayName: "Probe",
        breadcrumbProxy: 'dashboard.reports.pog.report.probe.summary'
      },
      templateUrl: 'dashboard/report/probe/probe.html',
      controller: 'controller.dashboard.report.probe',
      resolve: {
        report: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).get($stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.reports.pog.report.probe.summary', {
      url: '/summary',
      templateUrl: 'dashboard/report/probe/summary/summary.html',
      controller: 'controller.dashboard.report.probe.summary',
      data: {
        displayName: "Summary"
      },
      resolve: {
        testInformation: ['$q', '$stateParams', 'api.probe.testInformation', ($q, $stateParams, $ti) => {
          return $ti.get($stateParams.POG, $stateParams.analysis_report);
        }],
        genomicEvents: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
          return $get.all($stateParams.POG, $stateParams.analysis_report);
        }],
        signature: ['$q', '$stateParams', 'api.probe.signature', ($q, $stateParams, $signature) => {
          return $signature.get($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.reports.pog.report.probe.detailedGenomicAnalysis', {
      url: '/appendices',
      data: {
        displayName: "Appendices"
      },
      templateUrl: 'dashboard/report/probe/detailedGenomicAnalysis/detailedGenomicAnalysis.html',
      controller: 'controller.dashboard.report.probe.detailedGenomicAnalysis',
      resolve: {
        alterations: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
          return $alterations.getAll($stateParams.POG, $stateParams.analysis_report);
        }],
        approvedThisCancer: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
          return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
        }],
        approvedOtherCancer: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
          return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
        }],
      }
    })

    .state('dashboard.reports.pog.report.probe.appendices', {
      url: '/appendices',
      data: {
        displayName: "Appendices"
      },
      templateUrl: 'dashboard/report/probe/appendices/appendices.html',
      controller: 'controller.dashboard.report.probe.appendices',
      resolve: {
        tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', ($q, $stateParams, $appendices) => {
          return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.reports.pog.report.probe.meta', {
      url: '/meta',
      data: {
        displayName: "Report Meta Information"
      },
      templateUrl: 'dashboard/report/probe/meta/meta.html',
      controller: 'controller.dashboard.report.probe.meta',
    })


    /**
     * Genomic
     *
     */
    .state('dashboard.reports.pog.report.genomic', {
      url: '/{analysis_report}/genomic',
      data: {
        displayName: "Genomic",
        breadcrumbProxy: 'dashboard.reports.pog.report.genomic.summary'
      },
      templateUrl: 'dashboard/report/genomic/genomic.html',
      controller: 'controller.dashboard.report.genomic',
      resolve: {
        report: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).get($stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.reports.pog.report.genomic.summary', {
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
        vc: ['$q', '$stateParams', 'api.summary.variantCounts', ($q, $stateParams, $vc) => {
          return $vc.get($stateParams.POG, $stateParams.analysis_report);
        }],
        get: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
          return $get.all($stateParams.POG, $stateParams.analysis_report);
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        pt: ['$q', '$stateParams', 'api.summary.probeTarget', ($q, $stateParams, $pt) => {
          return $pt.all($stateParams.POG, $stateParams.analysis_report);
        }],
        mutationSignature: ['$q', '$stateParams', 'api.somaticMutations.mutationSignature', ($q, $stateParams, $mutationSignature) => {
          return $mutationSignature.all($stateParams.POG, $stateParams.analysis_report);
        }],
        microbial: ['$q', '$stateParams', 'api.summary.microbial', ($q, $stateParams, $microbial) => {
          return $microbial.get($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })


    .state('dashboard.reports.pog.report.genomic.analystComments', {
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

    .state('dashboard.reports.pog.report.genomic.pathwayAnalysis', {
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

    .state('dashboard.reports.pog.report.genomic.knowledgebase', {
      url: '/knowledgebase',
      data: {
        displayName: "Detailed Genomic Analysis"
      },
      templateUrl: 'dashboard/report/genomic/knowledgebase/knowledgebase.html',
      controller: 'controller.dashboard.report.genomic.knowledgebase',
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

    .state('dashboard.reports.pog.report.genomic.diseaseSpecificAnalysis', {
      url: '/diseaseSpecificAnalysis',
      data: {
        displayName: "Disease Specific Analysis"
      },
      templateUrl: 'dashboard/report/genomic/diseaseSpecificAnalysis/diseaseSpecificAnalysis.html',
      controller: 'controller.dashboard.report.genomic.diseaseSpecificAnalysis',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'subtypePlot.molecular,subtypePlot.receptorStatus,microbial.circos');
        }]
      }
    })

    .state('dashboard.reports.pog.report.genomic.microbial', {
      url: '/microbial',
      data: {
        displayName: "Microbial"
      },
      templateUrl: 'dashboard/report/genomic/microbial/microbial.html',
      controller: 'controller.dashboard.report.genomic.microbial',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'microbial.circos');
        }]
      }
    })
    
    .state('dashboard.reports.pog.report.genomic.spearman', {
      url: '/spearman',
      data: {
        displayName: "Spearman Plot Analysis"
      },
      templateUrl: 'dashboard/report/genomic/spearman/spearman.html',
      controller: 'controller.dashboard.report.genomic.spearman',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'expression.chart,expression.legend');
        }]
      }
    })

    .state('dashboard.reports.pog.report.genomic.smallMutations', {
      url: '/smallMutations',
      data: {
        displayName: "Somatic Mutations"
      },
      templateUrl: 'dashboard/report/genomic/smallMutations/smallMutations.html',
      controller: 'controller.dashboard.report.genomic.smallMutations',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSummary.snv,mutSummary.indel,mutSummary.barSnv,mutSummary.barIndel,mutSignature.corPcors,mutSignature.snvsAllStrelka');
        }],
        mutationSummaryImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.mutationSummary($stateParams.POG, $stateParams.analysis_report);
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

    .state('dashboard.reports.pog.report.genomic.copyNumberAnalyses', {
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

    .state('dashboard.reports.pog.report.genomic.structuralVariation', {
      url: '/structuralVariation',
      data: {
        displayName: "Structural Variation"
      },
      templateUrl: 'dashboard/report/genomic/structuralVariation/structuralVariation.html',
      controller: 'controller.dashboard.report.genomic.structuralVariation',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutation_summary.barplot_sv,mutation_summary.density_plot_sv,circosSv.genome,circosSv.transcriptome');
        }],
        ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
          return $ms.get($stateParams.POG, $stateParams.analysis_report);
        }],
        svs: ['$q', '$stateParams', 'api.structuralVariation.sv', ($q, $stateParams, $sv) => {
          return $sv.all($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })

    .state('dashboard.reports.pog.report.genomic.expressionAnalysis', {
      url: '/expressionAnalysis',
      data: {
        displayName: "Expression Analysis"
      },
      templateUrl: 'dashboard/report/genomic/expressionAnalysis/version02/expressionAnalysis.html',
      controller: 'controller.dashboard.report.genomic.expressionAnalysis',
      resolve: {
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

    .state('dashboard.reports.pog.report.genomic.appendices', {
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

    .state('dashboard.reports.pog.report.genomic.meta', {
      url: '/meta',
      data: {
        displayName: "POG Meta Information"
      },
      templateUrl: 'dashboard/report/genomic/meta/meta.html',
      controller: 'controller.dashboard.report.genomic.meta',
    })

    .state('dashboard.reports.pog.report.genomic.history', {
      url: '/history',
      data: {
        displayName: "Data History"
      },
      templateUrl: 'dashboard/report/genomic/history/history.html',
      controller: 'controller.dashboard.report.genomic.history',
      resolve: {
        history: ['$q', '$stateParams', 'api.pogDataHistory', ($q, $stateParams, $history) => {
          return $history($stateParams.POG, $stateParams.analysis_report).all();
        }],
        tags: ['$q', '$stateParams', 'api.pogDataHistory', ($q, $stateParams, $history) => {
          return $history($stateParams.POG, $stateParams.analysis_report).tag.all();
        }]
      }
    })

    .state('dashboard.reports.pog.report.genomic.therapeutic', {
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
        breadcrumbProxy: 'dashboard.admin.users.userList'
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
      url: '/report/:analysis_report',
      abstract: true,
      template: '<ui-view \\>',
      resolve: {
        report: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).get($stateParams.analysis_report);
        }]
      }
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
        "summary@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/summary/summary.html',
          controller: 'controller.print.POG.report.genomic.summary',
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
        },
        "analystComments@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/analystComments/analystComments.html',
          controller: 'controller.print.POG.report.genomic.analystComments',
          resolve: {
            comments: ['$q', '$stateParams', 'api.summary.analystComments', ($q, $stateParams, $comments) => {
              return $comments.get($stateParams.POG, $stateParams.analysis_report);
            }],
          }
        },
        "pathwayAnalysis@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/pathwayAnalysis/pathwayAnalysis.html',
          controller: 'controller.print.POG.report.genomic.pathwayAnalysis',
          resolve: {
            pathway: ['$q', '$stateParams', 'api.summary.pathwayAnalysis', ($q, $stateParams, $pathway) => {
              return $pathway.get($stateParams.POG, $stateParams.analysis_report);
            }]
          }
        },
        "pathwayAnalysisLegend@print.POG.report.genomic": { templateUrl: 'print/report/genomic/sections/pathwayAnalysis/pathwayAnalysisLegend.html' },
        "therapeuticOptions@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/therapeuticOptions/therapeuticOptions.html',
          controller: 'controller.print.POG.report.genomic.therapeuticOptions',
          resolve: {
            therapeutic: ['$q', '$stateParams', 'api.therapeuticOptions', ($q, $stateParams, $therapeutic) => {
              return $therapeutic.all($stateParams.POG, $stateParams.analysis_report);
            }],
          }
        },
        "dga@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/dga/dga.html',
          controller: 'controller.print.POG.report.genomic.dga',
          resolve: {
            alterations: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
              return $APC.getAll($stateParams.POG, $stateParams.analysis_report);
            }],
            unknownAlterations: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
              return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'unknown');
            }],
            approvedThisCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
              return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
            }],
            approvedOtherCancer: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', ($q, $stateParams, $APC) => {
              return $APC.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
            }]
          }
        },
        "diseaseSpecificAnalysis@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/diseaseSpecificAnalysis/diseaseSpecificAnalysis.html',
          controller: 'controller.print.POG.report.genomic.diseaseSpecificAnalysis',
          resolve: {
            images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
              return $image.get($stateParams.POG, $stateParams.analysis_report, 'subtypePlot.molecular,subtypePlot.receptorStatus,microbial.circos');
            }]
          }
        },
        "somaticMutations@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/somaticMutations/somaticMutations.html',
          controller: 'controller.print.POG.report.genomic.somaticMutations',
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
        },
        "copyNumberAnalysis@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/copyNumberAnalysis/copyNumberAnalysis.html',
          controller: 'controller.print.POG.report.genomic.copyNumberAnalysis',
          resolve: {
            images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
              return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnvLoh.circos');
            }],
            ms: ['$q', '$stateParams', 'api.summary.mutationSummary', ($q, $stateParams, $ms) => {
              return $ms.get($stateParams.POG, $stateParams.analysis_report);
            }],
            cnvs: ['$q', '$stateParams', 'api.copyNumberAnalyses.cnv', ($q, $stateParams, $cnv) => {
              return $cnv.all($stateParams.POG, $stateParams.analysis_report);
            }]
          }
        },
        "copyNumberAnalysisCNVLOH@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/copyNumberAnalysis/copyNumberAnalysisCNVLOH.html',
          controller: 'controller.print.POG.report.genomic.copyNumberAnalysisCNVLOH',
          resolve: {
            images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
              return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5');
            }]
          }
        },
        "structuralVariants@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/structuralVariants/structuralVariants.html',
          controller: 'controller.print.POG.report.genomic.structuralVariants',
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
        },
        "expressionAnalysis@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/expressionAnalysis/expressionAnalysis.html',
          controller: 'controller.print.POG.report.genomic.expressionAnalysis',
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
        },
        "appendices@print.POG.report.genomic": {
          templateUrl: 'print/report/genomic/sections/appendices/appendices.html',
          controller: 'controller.print.POG.report.genomic.appendices',
          resolve: {
            tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', ($q, $stateParams, $appendices) => {
              return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
            }]
          }
        }
      },
      resolve: {
        targetedGenes: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.targetedGenes', ($q, $stateParams, $tg) => {
          return $tg.getAll($stateParams.POG, $stateParams.analysis_report);
        }]
      }
    })



    .state('print.POG.report.probe', {
      url: '/probe',
      data: {
        displayName: 'Probe Report'
      },
      views: {
        "": {
          templateUrl: 'print/report/probe/probe.html',
          controller: 'controller.print.POG.report.probe',
        },
        "summary@print.POG.report.probe": {
          templateUrl: 'print/report/probe/sections/summary/summary.html',
          controller: 'controller.print.POG.report.probe.summary',
          resolve: {
            testInformation: ['$q', '$stateParams', 'api.probe.testInformation', ($q, $stateParams, $ti) => {
              return $ti.get($stateParams.POG, $stateParams.analysis_report);
            }],
            genomicEvents: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
              return $get.all($stateParams.POG, $stateParams.analysis_report);
            }],
            metrics: ['$q', 'api.knowledgebase', ($q, $kb) => {
              return $kb.metrics();
            }],
            signature: ['$q', '$stateParams', 'api.probe.signature', ($q, $stateParams, $signature) => {
              return $signature.get($stateParams.POG, $stateParams.analysis_report);
            }]
          }
        },
        "alterations@print.POG.report.probe": {
          templateUrl: 'print/report/probe/sections/alterations/alterations.html',
          controller: 'controller.print.POG.report.probe.alterations',
          resolve: {
            alterations: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
              return $alterations.getAll($stateParams.POG, $stateParams.analysis_report);
            }],
            approvedThisCancer: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
              return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
            }],
            approvedOtherCancer: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
              return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
            }]
          }
        },
        "appendices@print.POG.report.probe": {
          templateUrl: 'print/report/probe/sections/appendices/appendices.html',
          controller: 'controller.print.POG.report.probe.appendices',
        }
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

    .state('dashboard.tracking', {
      url: '/tracking',
      data: {
        displayName: 'POG Tracking',
        breadcrumbProxy: 'dashboard.tracking.board'
      },
      controller: 'controller.dashboard.tracking',
      templateUrl: 'dashboard/tracking/tracking.html',
      resolve: {
        definitions: ['$q', 'api.tracking.definition', ($q, $definition) => {
          return $definition.all();
        }]
      }
    })

    .state('dashboard.tracking.board', {
      url: '/board',
      data: {
        displayName: 'Board'
      },
      controller: 'controller.dashboard.tracking.board',
      templateUrl: 'dashboard/tracking/board/board.html',
      resolve: {
        states: ['$q', 'api.tracking.state', ($q, $state) => {
          return $state.all({status: 'pending,active,complete,hold'});
        }]
      }
    })

    .state('dashboard.tracking.definition', {
      url: '/definition',
      data: {
        displayName: 'State Definitions'
      },
      controller: 'controller.dashboard.tracking.definition',
      templateUrl: 'dashboard/tracking/definition/definition.html',
      resolve: {
        groups: ['$q', 'api.user', ($q, $user) => {
          return $user.group.all();
        }],
        definitions: ['$q', 'api.tracking.definition', ($q, $definition) => {
          return $definition.all({hidden: true});
        }]
      }
    })

    .state('dashboard.tracking.assignment', {
      url: '/assignment/:definition',
      data: {
        displayName: 'User Task Assignment'
      },
      controller: 'controller.dashboard.tracking.assignment',
      templateUrl: 'dashboard/tracking/assignment/assignment.html',
      resolve: {
        definition: ['$q', '$stateParams', 'api.tracking.definition', ($q, $stateParams, $definition) => {
          return $definition.retrieve($stateParams.definition);
        }],
        states: ['$q', 'api.tracking.state', 'definition', ($q, $state, definition) => {
          return $state.filtered({slug: definition.slug})
        }],
        group: ['$q', 'definition', 'api.user', ($q, definition, $user) => {
          return $user.group.retrieve(definition.group.ident);
        }],
        userLoad: ['$q', 'definition', 'api.tracking.definition', ($q, definition, $definition) => {
          return $definition.userLoad(definition.ident);
        }]
      }
    })
    
    .state('dashboard.tracking.ticket_template', {
      
      url: '/definition/:definition/ticket/template',
      data: {
        displayName: 'Ticket Templates'
      },
      controller: 'controller.dashboard.tracking.ticket_template',
      templateUrl: 'dashboard/tracking/assignment/assignment.ticket_template.html',
      resolve: {
        templates: ['$q', '$stateParams', 'api.tracking.ticket_template', ($q, $stateParams, $template) => {
          return $template.getDefTasks($stateParams.definition);
        }],
        definition: ['$q', '$stateParams', 'api.tracking.definition', ($q, $stateParams, $definition) => {
          return $definition.retrieve($stateParams.definition);
        }]
      }
    })
    
    .state('dashboard.biopsy', {
      url: '/biopsy',
      data: {
        displayName: 'Biopsies',
        breadcrumbProxy: 'dashboard.biopsy.board'
      },
      controller: 'controller.dashboard.biopsy',
      templateUrl: 'dashboard/biopsy/biopsy.html'
    })
    
    .state('dashboard.biopsy.board', {
      url: '/board',
      data: {
        displayName: 'Home'
      },
      controller: 'controller.dashboard.biopsy.board',
      templateUrl: 'dashboard/biopsy/board/board.html',
      resolve: {
        analyses: ['$q', 'api.analysis', ($q, $analysis) => {
          return $analysis.all();
        }]
      }
    })

}]);
