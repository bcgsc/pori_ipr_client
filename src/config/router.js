/**
 * Ui router configuration
 * @param {*} $stateProvider {@link https://ui-router.github.io/ng1/docs/latest/classes/ng1.stateprovider.html}
 * @param {*} $urlServiceProvider {@link https://ui-router.github.io/ng1/docs/latest/modules/injectables.html#_urlserviceprovider}
 * @param {*} $locationProvider {@link https://docs.angularjs.org/api/ng/provider/$locationProvider}
 * @return {*} router
 */
function router($stateProvider, $urlServiceProvider, $locationProvider) {
  /**
   * Checks for external mode errors and redirectExternal to genomic home page if so
   * @param {Object} transition object
   * @return {String | Boolean} Path or redirect false
   */
  const redirectExternal = async (transition) => {
    const $user = await transition.injector().getAsync('api.user');
    await $user.me();
    const $acl = await transition.injector().getAsync('$acl');
    /* Allow access to biopsy page if in biopsies group */
    const isExternalMode = transition.to().name.includes('biopsy') && await $acl.inGroup('biopsies')
      ? false
      : await transition.injector().getAsync('isExternalMode');
    return isExternalMode ? 'dashboard.reports.genomic' : false;
  };

  /**
   * Checks if the user has access to a specific case, based on project access
   * Redirects if no access
   * @param {Object} transition object
   * @return {String | Boolean} Path or redirect false
   */
  const redirectPOG = async (transition) => {
    await transition.injector().getAsync('user');
    const $acl = await transition.injector().getAsync('$acl');
    const $transition$ = await transition.injector().getAsync('$transition$');
    return await $acl.canAccessPOG($transition$.params().POG) ? false : 'dashboard.reports.genomic';
  };

  /**
   * Checks if the user is a clinician and redirects if so (for knowledgebase)
   * @param {Object} transition object
   * @return {String | Boolean} Path or redirect false
   */
  const redirectClinician = async (transition) => {
    await transition.injector().getAsync('user');
    const $acl = await transition.injector().getAsync('$acl');
    return await $acl.inGroup('clinician') ? 'dashboard.reports.genomic' : false;
  };

  /**
   * Checks if the user is an admin and redirects if not
   * @param {Object} transition object
   * @return {String | Boolean} Path or redirect false
   */
  const redirectAdmin = async (transition) => {
    await transition.injector().getAsync('user');
    return await transition.injector().getAsync('isAdmin') ? false : 'dashboard.reports.genomic';
  };

  // Enable HTML5 mode for URL access
  $locationProvider.html5Mode(true);

  // Don't require a perfect URL match (trailing slashes, etc)
  $urlServiceProvider.config.strictMode(false);
  // If no path could be found, send user to 404 error
  $urlServiceProvider.rules.otherwise({ state: 'error.404' });

  // Master State Provider
  // All states are defined and configured on this object
  $stateProvider

    // Default Public Entrance for Interactive-Pog-Report
    .state('public', {
      abstract: true,
      templateUrl: 'public/layout.html',
    })

    // Request access account for Interactive-Pog-Report
    .state('public.access', {
      url: '/access',
      templateUrl: 'public/access/access.html',
    })

    // Login to App
    .state('public.login', {
      url: '/login',
      controller: 'controller.public.login',
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
      templateUrl: 'errors/403.html',
    })

    // 404 Error - Resource Not Found
    .state('error.404', {
      url: '/404',
      templateUrl: 'errors/404.html',
    })

    // 500 Error - Server/API Error
    .state('error.500', {
      url: '/500',
      templateUrl: 'errors/500.html',
    })


    // Setup Dashboard state
    .state('dashboard', {
      abstract: true,
      views: {
        '@': {
          templateUrl: 'dashboard/dashboard.html',
          controller: 'controller.dashboard',
        },
        'toolbar@dashboard': {
          templateUrl: 'dashboard/toolbar.html',
          controller: 'controller.dashboard.toolbar',
        },
        'adminbar@dashboard': {
          templateUrl: 'dashboard/adminbar/adminbar.html',
          controller: 'controller.dashboard.adminbar',
        },
      },
      data: {
        displayName: 'Dashboard',
        breadcrumbProxy: 'dashboard.reports',
      },
      resolve: {
        user: ['api.user', '$userSettings', async ($user, $userSettings) => {
          const resp = await $user.me();
          $userSettings.init();
          return resp;
        }],
        isAdmin: ['api.user', 'user', async ($user, user) => {
          return $user.isAdmin();
        }],
        pogs: ['api.pog', 'user', async ($pog, user) => {
          return $pog.all();
        }],
        projects: ['api.project', 'user', async ($project, user) => {
          return $project.all();
        }],
        isExternalMode: ['$acl', 'user', async ($acl, user) => {
          return $acl.isExternalMode();
        }],
      },
    })

    .state('dashboard.home', {
      url: '/',
      controller: 'controller.dashboard.home',
    })

    // Dashboard Overview/POG Listing
    .state('dashboard.reports', {
      abstract: true,
      url: '/reports',
      templateUrl: 'dashboard/reports/reports.html',
      data: {
        displayName: 'Reports',
        breadcrumbProxy: 'dashboard.reports.dashboard',
      },
      resolve: {
        permission: ['$acl', '$state', 'user', '$mdToast', async ($acl, $state, user, $mdToast) => {
          if (!$acl.action('report.view', user)) {
            $mdToast.showSimple('You are not allowed to view reports');
            $state.go('dashboard.home');
            return false;
          }
          return true;
        }],
      },
    })

    .state('dashboard.reports.dashboard', {
      url: '/dashboard',
      templateUrl: 'dashboard/reports/dashboard/dashboard.html',
      controller: 'controller.dashboard.reports.dashboard',
      data: {
        displayName: 'Listing',
        breadcrumbProxy: ($state) => {
          if ($state.current.name.includes('report.probe')) return 'dashboard.reports.probe';
          if ($state.current.name.includes('report.genomic')) return 'dashboard.reports.genomic';
          return 'dashboard.reports.dashboard';
        },
      },
      redirectTo: redirectExternal,
      resolve: {
        reports: ['permission', 'api.pog_analysis_report', 'isExternalMode',
          async (permission, $report, isExternalMode) => {
            return $report.all({ states: 'ready,active' });
          }],
      },
    })

    .state('dashboard.reports.genomic', {
      url: '/genomic',
      templateUrl: 'dashboard/reports/genomic/genomic.html',
      controller: 'controller.dashboard.reports.genomic',
      data: {
        displayName: 'Genomic Reports',
      },
      resolve: {
        reports: ['$acl', 'api.pog_analysis_report', '$userSettings', 'user',
          'isExternalMode', async ($acl, $report, $userSettings, user, isExternalMode) => {
            const currentUser = $userSettings.get('genomicReportListCurrentUser');
            const project = $userSettings.get('selectedProject') || { name: undefined };
            const opts = {
              type: 'genomic',
            };

            if (currentUser) {
              opts.states = 'ready,active,presented';
              opts.project = project.name;
            } else {
              opts.all = true;
              opts.states = 'ready,active,presented';
              opts.project = project.name;
              $userSettings.save('genomicReportListCurrentUser', false);
            }

            if (isExternalMode) {
              opts.all = true;
              opts.states = 'presented,archived';
              opts.paginated = true;
            }
            return $report.all(opts);
          }],
      },
    })
    .state('dashboard.reports.probe', {
      url: '/probe',
      templateUrl: 'dashboard/reports/probe/probe.html',
      controller: 'controller.dashboard.reports.probe',
      data: {
        displayName: 'Targeted Gene Reports',
      },
      resolve: {
        reports: ['api.pog_analysis_report', '$acl', 'user', 'isExternalMode',
          async ($report, $acl, user, isExternalMode) => {
            const opts = {
              type: 'probe',
              all: true,
            };

            opts.states = 'uploaded,signedoff';

            if (isExternalMode) {
              opts.states = 'reviewed';
              opts.paginated = true;
            }
            return $report.all(opts);
          }],
      },
    })

    .state('dashboard.reports.pog', {
      data: {
        displayName: 'Patient',
        breadcrumbProxy: 'dashboard.reports.pog',
      },
      url: '/{POG}',
      controller: 'controller.dashboard.pog',
      templateUrl: 'dashboard/pog/pog.html',
      redirectTo: redirectPOG,
      resolve: {
        pog: ['_', '$stateParams', 'api.pog', 'user', async (_, $stateParams, $pog, user) => {
          const pogResp = await $pog.id($stateParams.POG);
          pogResp.myRoles = _.filter(pogResp.POGUsers, { user: { ident: user.ident } });
          return pogResp;
        }],
        reports: ['$stateParams', 'api.pog_analysis_report', '$acl', 'user', 'isExternalMode',
          async ($stateParams, $report, $acl, user, isExternalMode) => {
            let stateFilter = {};
            if (isExternalMode) {
              stateFilter = { state: 'presented,archived' };
            }
            return $report.pog($stateParams.POG).all(stateFilter);
          }],
      },
    })

    .state('dashboard.reports.pog.report', {
      abstract: true,
      url: '/report',
      data: {
        displayName: 'Analysis Reports',
        breadcrumbProxy: 'dashboard.reports.pog',
      },
      templateUrl: 'dashboard/report/report.html',
    })

    /**
     * Probing
     *
     */
    .state('dashboard.reports.pog.report.probe', {
      url: '/{analysis_report}/probe',
      data: {
        displayName: 'Targeted Gene',
        breadcrumbProxy: 'dashboard.reports.pog.report.probe.summary',
      },
      templateUrl: 'dashboard/report/probe/probe.html',
      controller: 'controller.dashboard.report.probe',
      redirectTo: redirectPOG,
      resolve: {
        report: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).get($stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.probe.summary', {
      url: '/summary',
      templateUrl: 'dashboard/report/probe/summary/summary.html',
      controller: 'controller.dashboard.report.probe.summary',
      data: {
        displayName: 'Summary',
      },
      redirectTo: redirectPOG,
      resolve: {
        testInformation: ['$q', '$transition$', 'api.probe.testInformation', ($q, $transition$, $ti) => {
          return $ti.get($transition$.params().POG, $transition$.params().analysis_report);
        }],
        genomicEvents: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
          return $get.all($stateParams.POG, $stateParams.analysis_report);
        }],
        signature: ['$q', '$stateParams', 'api.probe.signature', ($q, $stateParams, $signature) => {
          return $signature.get($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.probe.detailedGenomicAnalysis', {
      url: '/detailedGenomicAnalysis',
      data: {
        displayName: 'Detailed Genomic Analysis',
      },
      redirectTo: redirectPOG,
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
      },
    })

    .state('dashboard.reports.pog.report.probe.appendices', {
      url: '/appendices',
      data: {
        displayName: 'Appendices',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/probe/appendices/appendices.html',
      controller: 'controller.dashboard.report.probe.appendices',
      resolve: {
        tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', ($q, $stateParams, $appendices) => {
          return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.probe.meta', {
      url: '/meta',
      data: {
        displayName: 'Report Meta Information',
      },
      redirectTo: redirectPOG,
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
        displayName: 'Genomic',
        breadcrumbProxy: 'dashboard.reports.pog.report.genomic.summary',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/genomic.html',
      controller: 'controller.dashboard.report.genomic',
      resolve: {
        report: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).get($stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.summary', {
      url: '/summary',
      templateUrl: 'dashboard/report/genomic/summary/summary.html',
      controller: 'controller.dashboard.report.genomic.summary',
      data: {
        displayName: 'Summary',
      },
      redirectTo: redirectPOG,
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
        }],
      },
    })


    .state('dashboard.reports.pog.report.genomic.analystComments', {
      url: '/analystComments',
      data: {
        displayName: 'Analyst Comments',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/analystComments/analystComments.html',
      controller: 'controller.dashboard.report.genomic.analystComments',
      resolve: {
        comments: ['$q', '$stateParams', 'api.summary.analystComments', ($q, $stateParams, $comments) => {
          return $comments.get($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.pathwayAnalysis', {
      url: '/pathwayAnalysis',
      data: {
        displayName: 'Pathway Analysis',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/pathwayAnalysis/pathwayAnalysis.html',
      controller: 'controller.dashboard.report.genomic.pathwayAnalysis',
      resolve: {
        pathway: ['$q', '$stateParams', 'api.summary.pathwayAnalysis', ($q, $stateParams, $pathway) => {
          return $pathway.get($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.knowledgebase', {
      url: '/knowledgebase',
      data: {
        displayName: 'Detailed Genomic Analysis',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/knowledgebase/knowledgebase.html',
      controller: 'controller.dashboard.report.genomic.knowledgebase',
      resolve: {
        alterations: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.alterations', async ($q, $stateParams, $APC) => {
          const respAll = await $APC.getAll($stateParams.POG, $stateParams.analysis_report);
          const respUnknown = await $APC.getType($stateParams.POG, $stateParams.analysis_report, 'unknown');
          const respNovel = await $APC.getType($stateParams.POG, $stateParams.analysis_report, 'novel');
          return respAll.concat(respUnknown, respNovel);
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
      },
    })

    .state('dashboard.reports.pog.report.genomic.diseaseSpecificAnalysis', {
      url: '/diseaseSpecificAnalysis',
      data: {
        displayName: 'Disease Specific Analysis',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/diseaseSpecificAnalysis/diseaseSpecificAnalysis.html',
      controller: 'controller.dashboard.report.genomic.diseaseSpecificAnalysis',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'microbial.circos');
        }],
        subtypePlotImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.subtypePlots($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.microbial', {
      url: '/microbial',
      data: {
        displayName: 'Microbial',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/microbial/microbial.html',
      controller: 'controller.dashboard.report.genomic.microbial',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'microbial.circos.transcriptome,microbial.circos.genome,microbial.circos');
        }],
      },
    })
    
    .state('dashboard.reports.pog.report.genomic.spearman', {
      url: '/spearman',
      data: {
        displayName: 'Spearman Plot Analysis',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/spearman/spearman.html',
      controller: 'controller.dashboard.report.genomic.spearman',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'expression.chart,expression.legend');
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.smallMutations', {
      url: '/smallMutations',
      data: {
        displayName: 'Somatic Mutations',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/smallMutations/smallMutations.html',
      controller: 'controller.dashboard.report.genomic.smallMutations',
      resolve: {
        images: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSignature.corPcors,mutSignature.snvsAllStrelka');
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
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.copyNumberAnalyses', {
      url: '/copyNumberAnalyses',
      data: {
        displayName: 'Copy Number Analyses',
      },
      redirectTo: redirectPOG,
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
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.structuralVariation', {
      url: '/structuralVariation',
      data: {
        displayName: 'Structural Variation',
      },
      redirectTo: redirectPOG,
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
        }],
        mutationSummaryImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.mutationSummary($stateParams.POG, $stateParams.analysis_report);
        }],
        mavisSummary: ['$q', '$stateParams', 'api.mavis', ($q, $stateParams, $mavis) => {
          return $mavis.all($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.expressionAnalysis', {
      url: '/expressionAnalysis',
      data: {
        displayName: 'Expression Analysis',
      },
      redirectTo: redirectPOG,
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
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.discussion', {
      url: '/discussion',
      data: {
        displayName: 'Presentation Discussion',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/presentation/discussion/discussion.html',
      controller: 'controller.dashboard.report.genomic.discussion',
      resolve: {
        discussions: ['$q', '$stateParams', 'api.presentation', ($q, $stateParams, $presentation) => {
          return $presentation.discussion.all($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.slide', {
      url: '/slide',
      data: {
        displayName: 'Presentation Slides',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/presentation/slide/slide.html',
      controller: 'controller.dashboard.report.genomic.slide',
      resolve: {
        slides: ['$q', '$stateParams', 'api.presentation', ($q, $stateParams, $presentation) => {
          return $presentation.slide.all($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.appendices', {
      url: '/appendices',
      data: {
        displayName: 'Appendices',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/appendices/appendices.html',
      controller: 'controller.dashboard.report.genomic.appendices',
      resolve: {
        tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', ($q, $stateParams, $appendices) => {
          return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.meta', {
      url: '/meta',
      data: {
        displayName: 'Patient Meta Information',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/meta/meta.html',
      controller: 'controller.dashboard.report.genomic.meta',
    })

    .state('dashboard.reports.pog.report.genomic.history', {
      url: '/history',
      data: {
        displayName: 'Data History',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/history/history.html',
      controller: 'controller.dashboard.report.genomic.history',
      resolve: {
        history: ['$q', '$stateParams', 'api.pogDataHistory', ($q, $stateParams, $history) => {
          return $history($stateParams.POG, $stateParams.analysis_report).all();
        }],
        tags: ['$q', '$stateParams', 'api.pogDataHistory', ($q, $stateParams, $history) => {
          return $history($stateParams.POG, $stateParams.analysis_report).tag.all();
        }],
      },
    })

    .state('dashboard.reports.pog.report.genomic.therapeutic', {
      url: '/therapeutic',
      data: {
        displayName: 'Potential Therapeutic Targets',
      },
      redirectTo: redirectPOG,
      templateUrl: 'dashboard/report/genomic/therapeutic/therapeutic.html',
      controller: 'controller.dashboard.report.genomic.therapeutic',
      resolve: {
        therapeutic: ['$q', '$stateParams', 'api.therapeuticOptions', ($q, $stateParams, $therapeutic) => {
          return $therapeutic.all($stateParams.POG, $stateParams.analysis_report);
        }],
      },
    })

    .state('dashboard.admin', {
      url: '/admin',
      data: {
        displayName: 'Administration',
      },
      redirectTo: redirectAdmin,
      templateUrl: 'dashboard/admin/admin.html',
    })

    .state('dashboard.admin.users', {
      url: '/users',
      data: {
        displayName: 'Permissions',
        breadcrumbProxy: 'dashboard.admin.users.userList',
      },
      redirectTo: redirectAdmin,
      controller: 'controller.dashboard.admin.users',
      templateUrl: 'dashboard/admin/user/users.html',
      resolve: {
        users: ['$q', 'api.user', ($q, $user) => {
          return $user.all();
        }],
        groups: ['$q', 'api.user', 'api.group', ($q, $user, $group) => {
          return $group.all();
        }],
        projects: ['$q', 'api.project', ($q, $project) => {
          return $project.all({ admin: true });
        }],
      },
    })

    .state('dashboard.admin.users.userList', {
      url: '/userList',
      data: {
        displayName: 'Users',
      },
      redirectTo: redirectAdmin,
      controller: 'controller.dashboard.admin.users.userList',
      templateUrl: 'dashboard/admin/user/userList.html',
      resolve: {
        projects: ['$q', 'api.project', ($q, $project) => {
          return $project.all({ admin: true });
        }],
        groups: ['api.group', ($group) => {
          return $group.all();
        }],
      },
    })

    .state('dashboard.admin.users.groups', {
      url: '/groups',
      data: {
        displayName: 'Groups',
      },
      redirectTo: redirectAdmin,
      controller: 'controller.dashboard.admin.users.groups',
      templateUrl: 'dashboard/admin/user/group.html',
    })

    .state('dashboard.admin.users.projects', {
      url: '/projects',
      data: {
        displayName: 'Projects',
      },
      redirectTo: redirectAdmin,
      controller: 'controller.dashboard.admin.users.projects',
      templateUrl: 'dashboard/admin/user/project.html',
    })

    .state('print', {
      url: '/print',
      abstract: true,
      templateUrl: 'print/print.html',
      controller: 'controller.print',
      data: {
        displayName: 'Print',
      },
      resolve: {
        user: ['$q', 'api.user', '$userSettings', ($q, $user, $userSettings) => {
          return $q((resolve, reject) => {
            $user.me()
              .then(() => {
                $userSettings.init();
                resolve($user.meObj);
              })
              .catch((err) => {
                reject(err);
              });
          });
        }],
        isExternalMode: ['$acl', 'user', async ($acl, user) => {
          return $acl.isExternalMode();
        }],
      },
    })

    .state('print.POG', {
      url: '/:POG',
      abstract: true,
      template: '<ui-view \\>',
      redirectTo: redirectPOG,
      resolve: {
        pog: ['$transition$', 'api.pog', async ($transition$, $pog) => {
          return $pog.id($transition$.params().POG);
        }],
      },
    })

    .state('print.POG.report', {
      url: '/report/:analysis_report',
      abstract: true,
      template: '<ui-view \\>',
      redirectTo: redirectPOG,
      resolve: {
        report: ['$q', '$stateParams', 'api.pog_analysis_report', ($q, $stateParams, $report) => {
          return $report.pog($stateParams.POG).get($stateParams.analysis_report);
        }],
      },
    })

    .state('print.POG.report.genomic', {
      url: '/genomic',
      redirectTo: redirectPOG,
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
        microbial: ['$q', '$stateParams', 'api.summary.microbial', ($q, $stateParams, $microbial) => {
          return $microbial.get($stateParams.POG, $stateParams.analysis_report);
        }],
        comments: ['$q', '$stateParams', 'api.summary.analystComments', ($q, $stateParams, $comments) => {
          return $comments.get($stateParams.POG, $stateParams.analysis_report);
        }],
        pathway: ['$q', '$stateParams', 'api.summary.pathwayAnalysis', ($q, $stateParams, $pathway) => {
          return $pathway.get($stateParams.POG, $stateParams.analysis_report);
        }],
        therapeutic: ['$q', '$stateParams', 'api.therapeuticOptions', ($q, $stateParams, $therapeutic) => {
          return $therapeutic.all($stateParams.POG, $stateParams.analysis_report);
        }],
        slides: ['$q', '$stateParams', 'api.presentation', ($q, $stateParams, $presentation) => {
          return $presentation.slide.all($stateParams.POG, $stateParams.analysis_report);
        }],
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
        }],
        diseaseImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'microbial.circos');
        }],
        subtypePlotImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.subtypePlots($stateParams.POG, $stateParams.analysis_report);
        }],
        somaticImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSummary.snv,mutSummary.indel,mutSummary.barSnv,mutSummary.barIndel,mutSignature.corPcors,mutSignature.snvsAllStrelka');
        }],
        smallMutations: ['$q', '$stateParams', 'api.somaticMutations.smallMutations', ($q, $stateParams, $smallMuts) => {
          return $smallMuts.all($stateParams.POG, $stateParams.analysis_report);
        }],
        mutationSummaryImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.mutationSummary($stateParams.POG, $stateParams.analysis_report);
        }],
        copyNumberAnalysisImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnvLoh.circos');
        }],
        cnvs: ['$q', '$stateParams', 'api.copyNumberAnalyses.cnv', ($q, $stateParams, $cnv) => {
          return $cnv.all($stateParams.POG, $stateParams.analysis_report);
        }],
        cnvlohImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5');
        }],
        structuralVariantImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'mutSummary.barSv,mutSummary.sv,circosSv.genome,circosSv.transcriptome');
        }],
        svs: ['$q', '$stateParams', 'api.structuralVariation.sv', ($q, $stateParams, $sv) => {
          return $sv.all($stateParams.POG, $stateParams.analysis_report);
        }],
        expressionImages: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.get($stateParams.POG, $stateParams.analysis_report, 'expression.chart,expression.legend');
        }],
        outliers: ['$q', '$stateParams', 'api.expressionAnalysis.outlier', ($q, $stateParams, $outliers) => {
          return $outliers.all($stateParams.POG, $stateParams.analysis_report);
        }],
        drugTargets: ['$q', '$stateParams', 'api.expressionAnalysis.drugTarget', ($q, $stateParams, $drugTarget) => {
          return $drugTarget.all($stateParams.POG, $stateParams.analysis_report);
        }],
        densityGraphs: ['$q', '$stateParams', 'api.image', ($q, $stateParams, $image) => {
          return $image.expDensityGraphs($stateParams.POG, $stateParams.analysis_report);
        }],
        tcgaAcronyms: ['$q', '$stateParams', 'api.appendices', ($q, $stateParams, $appendices) => {
          return $appendices.tcga($stateParams.POG, $stateParams.analysis_report);
        }],
        targetedGenes: ['$q', '$stateParams', 'api.detailedGenomicAnalysis.targetedGenes', ($q, $stateParams, $tg) => {
          return $tg.getAll($stateParams.POG, $stateParams.analysis_report);
        }],
      },
      views: {
        '': {
          templateUrl: 'print/report/genomic/genomic.html',
          controller: 'controller.print.POG.report.genomic',
        },
        'summary@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/summary/summary.html',
          controller: 'controller.print.POG.report.genomic.summary',
        },
        'analystComments@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/analystComments/analystComments.html',
          controller: 'controller.print.POG.report.genomic.analystComments',
        },
        'pathwayAnalysis@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/pathwayAnalysis/pathwayAnalysis.html',
          controller: 'controller.print.POG.report.genomic.pathwayAnalysis',
        },
        'pathwayAnalysisLegend@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/pathwayAnalysis/pathwayAnalysisLegend.html',
        },
        'therapeuticOptions@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/therapeuticOptions/therapeuticOptions.html',
          controller: 'controller.print.POG.report.genomic.therapeuticOptions',
        },
        'presentationSlide@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/presentation/slide.html',
          controller: 'controller.print.POG.report.genomic.slide',
        },
        'dga@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/dga/dga.html',
          controller: 'controller.print.POG.report.genomic.dga',
        },
        'diseaseSpecificAnalysis@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/diseaseSpecificAnalysis/diseaseSpecificAnalysis.html',
          controller: 'controller.print.POG.report.genomic.diseaseSpecificAnalysis',
        },
        'somaticMutations@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/somaticMutations/somaticMutations.html',
          controller: 'controller.print.POG.report.genomic.somaticMutations',
        },
        'copyNumberAnalysis@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/copyNumberAnalysis/copyNumberAnalysis.html',
          controller: 'controller.print.POG.report.genomic.copyNumberAnalysis',
        },
        'copyNumberAnalysisCNVLOH@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/copyNumberAnalysis/copyNumberAnalysisCNVLOH.html',
          controller: 'controller.print.POG.report.genomic.copyNumberAnalysisCNVLOH',
        },
        'structuralVariants@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/structuralVariants/structuralVariants.html',
          controller: 'controller.print.POG.report.genomic.structuralVariants',
        },
        'expressionAnalysis@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/expressionAnalysis/expressionAnalysis.html',
          controller: 'controller.print.POG.report.genomic.expressionAnalysis',
        },
        'appendices@print.POG.report.genomic': {
          templateUrl: 'print/report/genomic/sections/appendices/appendices.html',
          controller: 'controller.print.POG.report.genomic.appendices',
        },
      },
    })


    .state('print.POG.report.probe', {
      url: '/probe',
      redirectTo: redirectPOG,
      resolve: {
        testInformation: ['$q', '$transition$', 'api.probe.testInformation', ($q, $transition$, $ti) => {
          return $ti.get($transition$.params().POG, $transition$.params().analysis_report);
        }],
        genomicEvents: ['$q', '$stateParams', 'api.summary.genomicEventsTherapeutic', ($q, $stateParams, $get) => {
          return $get.all($stateParams.POG, $stateParams.analysis_report);
        }],
        metrics: ['$q', 'api.knowledgebase', ($q, $kb) => {
          return $kb.metrics();
        }],
        signature: ['$q', '$stateParams', 'api.probe.signature', ($q, $stateParams, $signature) => {
          return $signature.get($stateParams.POG, $stateParams.analysis_report);
        }],
        alterations: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
          return $alterations.getAll($stateParams.POG, $stateParams.analysis_report);
        }],
        approvedThisCancer: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
          return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'thisCancer');
        }],
        approvedOtherCancer: ['$q', '$stateParams', 'api.probe.alterations', ($q, $stateParams, $alterations) => {
          return $alterations.getType($stateParams.POG, $stateParams.analysis_report, 'otherCancer');
        }],
      },
      views: {
        '': {
          templateUrl: 'print/report/probe/probe.html',
          controller: 'controller.print.POG.report.probe',
        },
        'summary@print.POG.report.probe': {
          templateUrl: 'print/report/probe/sections/summary/summary.html',
          controller: 'controller.print.POG.report.probe.summary',
        },
        'alterations@print.POG.report.probe': {
          templateUrl: 'print/report/probe/sections/alterations/alterations.html',
          controller: 'controller.print.POG.report.probe.alterations',
        },
        'appendices@print.POG.report.probe': {
          templateUrl: 'print/report/probe/sections/appendices/appendices.html',
          controller: 'controller.print.POG.report.probe.appendices',
        },
      },
    })

    .state('dashboard.knowledgebase', {
      url: '/knowledgebase',
      abstract: true,
      data: {
        displayName: 'Dashboard',
        breadcrumbProxy: 'dashboard.knowledgebase.references',
      },
      controller: 'knowledgebase',
      templateUrl: 'dashboard/knowledgebase/knowledgebase.html',
    })

    .state('dashboard.knowledgebase.dashboard', {
      url: '/dashboard',
      data: {
        displayName: 'Knowledgebase',
      },
      redirectTo: redirectClinician,
      controller: 'knowledgebase.dashboard',
      templateUrl: 'dashboard/knowledgebase/dashboard/dashboard.html',
      resolve: {
        metrics: ['api.knowledgebase', ($kb) => {
          return $kb.metrics();
        }],
        permission: ['isExternalMode', async (isExternalMode) => {
          return isExternalMode;
        }],
      },
    })

    .state('dashboard.knowledgebase.references', {
      url: '/references',
      data: {
        displayName: 'References',
      },
      params: {
        filters: null,
      },
      redirectTo: redirectClinician,
      controller: 'knowledgebase.references',
      templateUrl: 'dashboard/knowledgebase/references/references.html',
      resolve: {
        references: ['$q', 'api.knowledgebase', '$stateParams', ($q, $kb, $stateParams) => {
          if ($stateParams.filters) {
            return $kb.references.all(100, 0, $stateParams.filters);
          }
          return $kb.references.all(100, 0);
        }],
        ref_count: ['$q', 'api.knowledgebase', '$stateParams', ($q, $kb, $stateParams) => {
          if ($stateParams.filters !== null) {
            return $kb.references.count($stateParams.filters);
          }
          return $kb.references.count();
        }],
        vocabulary: ['$q', 'api.knowledgebase', ($q, $kb) => {
          return $kb.vocabulary();
        }],
        permission: ['isExternalMode', async (isExternalMode) => {
          return isExternalMode;
        }],
      },
    })

  // Commenting out instead of removing in case we decide to re-include this
  // Excluding as per Cara Reisle's suggestion
  /*
    .state('dashboard.knowledgebase.events', {
      url: '/events',
      data: {
        displayName: 'Events'
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
        }],
        permission: ['$q', '$acl', 'user', ($q, $acl, user) => {
          if($acl.inGroup('clinician')) {
            return $q((resolve, reject) => {
              reject(new Error('externalModeError'));
            })
          }
        }]
      }
    })
    */

    .state('dashboard.tracking', {
      url: '/tracking',
      data: {
        displayName: 'Tracking',
        breadcrumbProxy: 'dashboard.tracking.board',
      },
      controller: 'controller.dashboard.tracking',
      templateUrl: 'dashboard/tracking/tracking.html',
      redirectTo: redirectExternal,
      resolve: {
        definitions: ['$q', 'api.tracking.definition', ($q, $definition) => {
          return $definition.all();
        }],
        // User object injected to ensure settings have been captured
        myDefinitions: ['$q', '_', 'api.tracking.definition', 'user', '$userSettings', ($q, _, $definition, user, $userSettings) => {
          return $definition.all({ slug: ($userSettings.get('tracking.definition')) ? _.join($userSettings.get('tracking.definition').slug, ',') : undefined });
        }],
        permission: ['isExternalMode', async (isExternalMode) => {
          return isExternalMode;
        }],
      },
    })

    .state('dashboard.tracking.board', {
      url: '/board',
      data: {
        displayName: 'Board',
      },
      controller: 'controller.dashboard.tracking.board',
      templateUrl: 'dashboard/tracking/board/board.html',
      redirectTo: redirectExternal,
      resolve: {
        states: ['_', 'api.tracking.state', 'user', '$userSettings',
          async (_, $state, user, $userSettings) => {
            return $state.all({
              status: ($userSettings.get('tracking.state'))
                ? _.join($userSettings.get('tracking.state').status, ',')
                : 'pending,active,hold,failed',
            });
          }],
      },
    })

    .state('dashboard.tracking.lane', {
      url: '/board/:slug',
      data: {
        displayName: '{{lane.name}}',
      },
      controller: 'controller.dashboard.tracking.lane',
      templateUrl: 'dashboard/tracking/board/board.lane.html',
      redirectTo: redirectExternal,
      resolve: {
        lane: ['$q', '$stateParams', 'api.tracking.definition', ($q, $stateParams, $definition) => {
          return $definition.retrieve($stateParams.slug);
        }],
        states: ['$q', '$stateParams', 'api.tracking.state', ($q, $stateParams, $state) => {
          return $state.filtered({ slug: $stateParams.slug, status: 'active,pending' });
        }],
      },
    })

    .state('dashboard.tracking.definition', {
      url: '/definition',
      data: {
        displayName: 'State Definitions',
      },
      controller: 'controller.dashboard.tracking.definition',
      templateUrl: 'dashboard/tracking/definition/definition.html',
      redirectTo: redirectExternal,
      resolve: {
        groups: ['api.group', ($group) => {
          return $group.all();
        }],
        definitions: ['$q', 'api.tracking.definition', ($q, $definition) => {
          return $definition.all({ hidden: true });
        }],
        hooks: ['$q', 'api.tracking.hook', ($q, $hook) => {
          return $hook.all();
        }],
      },
    })

    .state('dashboard.tracking.assignment', {
      url: '/assignment/:definition',
      data: {
        displayName: 'User Task Assignment',
      },
      controller: 'controller.dashboard.tracking.assignment',
      templateUrl: 'dashboard/tracking/assignment/assignment.html',
      redirectTo: redirectExternal,
      resolve: {
        definition: ['$q', '$stateParams', 'api.tracking.definition', ($q, $stateParams, $definition) => {
          return $definition.retrieve($stateParams.definition);
        }],
        ticket_templates: ['$q', '$stateParams', 'api.tracking.ticket_template', ($q, $stateParams, $ticket) => {
          return $ticket.getDefTasks($stateParams.definition);
        }],
        states: ['$q', 'api.tracking.state', 'definition', ($q, $state, definition) => {
          return $state.filtered({ slug: definition.slug, status: 'active,pending' });
        }],
        group: ['definition', 'api.group', (definition, $group) => {
          return $group.retrieve(definition.group.ident);
        }],
        userLoad: ['$q', 'definition', 'api.tracking.definition', ($q, definition, $definition) => {
          return $definition.userLoad(definition.ident);
        }],
      },
    })
    
    .state('dashboard.tracking.ticket_template', {
      
      url: '/definition/:definition/ticket/template',
      data: {
        displayName: 'Ticket Templates',
      },
      controller: 'controller.dashboard.tracking.ticket_template',
      templateUrl: 'dashboard/tracking/assignment/assignment.ticket_template.html',
      redirectTo: redirectExternal,
      resolve: {
        templates: ['$q', '$stateParams', 'api.tracking.ticket_template', ($q, $stateParams, $template) => {
          return $template.getDefTasks($stateParams.definition);
        }],
        definition: ['$q', '$stateParams', 'api.tracking.definition', ($q, $stateParams, $definition) => {
          return $definition.retrieve($stateParams.definition);
        }],
      },
    })
    
    .state('dashboard.biopsy', {
      url: '/biopsy',
      abstract: true,
      data: {
        displayName: 'Biopsies',
        breadcrumbProxy: 'dashboard.biopsy.board',
      },
    })
    
    .state('dashboard.biopsy.board', {
      url: '/board',
      data: {
        displayName: 'Home',
      },
      controller: 'controller.dashboard.biopsy.board',
      templateUrl: 'dashboard/biopsy/board/board.html',
      redirectTo: redirectExternal,
      resolve: {
        analyses: ['$q', 'api.analysis', ($q, $analysis) => {
          return $analysis.all({ paginated: true });
        }],
        comparators: ['$q', 'api.analysis', ($q, $analysis) => {
          return $analysis.comparators();
        }],
        projects: ['api.project', ($project) => {
          return $project.all();
        }],
      },
    })
    
    .state('dashboard.germline', {
      url: '/germline',
      data: {
        displayName: 'Germline',
        breadcrumbProxy: 'dashboard.germline.board',
      },
      controller: 'controller.dashboard.germline',
      templateUrl: 'dashboard/germline/germline.html',
      resolve: {
        permission: ['isExternalMode', async (isExternalMode) => {
          return isExternalMode;
        }],
      },
    })
    
    .state('dashboard.germline.board', {
      url: '/board',
      data: {
        displayName: 'Reports',
      },
      redirectTo: redirectExternal,
      controller: 'controller.dashboard.germline.board',
      templateUrl: 'dashboard/germline/board/board.html',
      resolve: {
        reports: ['api.germline.report', ($report) => {
          return $report.all();
        }],
      },
    })
    
    .state('dashboard.germline.report', {
      url: '/report/patient/:patient/biopsy/:biopsy/report/:report',
      data: {
        displayName: 'Reports',
      },
      redirectTo: redirectExternal || redirectPOG,
      controller: 'controller.dashboard.germline.report',
      templateUrl: 'dashboard/germline/report/report.html',
      resolve: {
        report: ['api.germline.report', '$stateParams', ($report, $stateParams) => {
          return $report.one($stateParams.patient, $stateParams.biopsy, $stateParams.report);
        }],
      },
    });
}

router.$injector = ['$stateProvider', '$urlServiceProvider', '$locationProvider'];

angular
  .module('bcgscIPR')
  .config(router);
