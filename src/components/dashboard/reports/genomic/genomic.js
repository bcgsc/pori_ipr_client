app.controller('controller.dashboard.reports.genomic', ['_', '$q', '$rootScope', '$scope',
  'api.pog_analysis_report', 'reports', '$mdDialog', 'user', '$userSettings', 'projects', '$acl',
  'isExternalMode', (_, $q, $rootScope, $scope, $report, reports, $mdDialog, user, $userSettings,
    projects, $acl, isExternalMode) => {
  $scope.reports = reports.reports;
  $scope.archived = false;
  $scope.nonproduction = false;
  $scope.loading = false;
  $scope.externalMode = isExternalMode;
  $scope.selectedProject = {
    project: $userSettings.get('selectedProject') ? $userSettings.get('selectedProject') : {},
  }

  $scope.roles = [
    'bioinformatician',
    'analyst',
    'reviewer',
    'admin',
    'clinician'
  ];
  
  $scope.projects = projects;

  $scope.states = {
    ready: true,
    active: true,
    presented: true,
    archived: false,
    nonproduction: false
  };

  if (isExternalMode) {
    $scope.pagination = {
      offset: 0,
      limit: 25,
      total: reports.total
    };
  }


  $scope.filter = {
    currentUser: $userSettings.get('genomicReportListCurrentUser'),
    query: null,
  };

  $scope.numReports = (state) => {
    return _.filter($scope.reports, {state: state}).length;
  };

  $scope.$watch('filter.currentUser', (newVal, oldVal) => {
    // Ignore onload message
    if(JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('genomicReportListCurrentUser', newVal);
  }, true);
  
  $scope.$watch('selectedProject', (newVal, oldVal) => {
    if(JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('selectedProject', newVal);
  }, true);

  $scope.refreshList = () => {
    let states = [];
    _.each($scope.states, (v,k) => {
      if(v) states.push(k);
    });
    $scope.loading = true;
    $report.all({
      all: !$scope.filter.currentUser,
      query: $scope.filter.query,
      role: $scope.filter.role,
      states: _.join(states, ','),
      type: 'genomic',
      project: $scope.selectedProject.project.name || null,
    }).then(
      (result) => {
        $scope.loading = false;
        $scope.reports = reports = result;
        $scope.reports = reports = _.orderBy(result, ['analysis.pog.POGID','createdAt'], ['asc','desc']);
        $userSettings.save('selectedProject', {
          name: $scope.selectedProject.project.name || null,
        });
        associateUsers();
      },
      (err) => {
        console.log('Unable to get reports', err);
      }
    )
  };

  let associateUsers = () => {
    // Filter Users For a POG
    _.forEach($scope.reports, (r, i) => {
      // Loop over pogusers
      $scope.reports[i].myRoles = _.filter(r.users, {user: {ident: user.ident}});
    });
  };

  associateUsers();

  $scope.searchPogs = (state, query) => {

    return (report) => {

      if(!query) query = "";

      // Define Return result
      let result = false;

      // Run over each split by space
      _.forEach(query.split(' '), (q) => {

        if(report.state !== state) return false;


        if(q.length === 0) return result = true;

        // Pog ID?
        if(report.analysis.pog.POGID.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Tumour Type
        if(report.patientInformation !== null && report.patientInformation.tumourType && report.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Tumour Type & Ploidy Model
        //if(pog.patientInformation.tumourType && pog.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;
        if(!report.tumourAnalysis) return;

        if(report.tumourAnalysis && report.tumourAnalysis.ploidy && report.tumourAnalysis.ploidy.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Comparators
        if(report.tumourAnalysis && report.tumourAnalysis.diseaseExpressionComparator && report.tumourAnalysis.diseaseExpressionComparator.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true; // Disease
        if(report.tumourAnalysis && report.tumourAnalysis.normalExpressionComparator && report.tumourAnalysis.normalExpressionComparator.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true; // Normal

        // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
        if(q.toLowerCase().indexOf('tc>') !== -1) (report.tumourAnalysis.tumourContent > parseInt(_.last(q.split('>')))) ? result = true : null;
        if(q.toLowerCase().indexOf('tc<') !== -1) (report.tumourAnalysis.tumourContent < parseInt(_.last(q.split('<')))) ? result = true : null;
        if(q.toLowerCase().indexOf('tc=') !== -1) (report.tumourAnalysis.tumourContent === parseInt(_.last(q.split('=')))) ? result = true : null;

        // Search Users
        _.forEach(report.users, (p) => {
          if(p.user.firstName.toLowerCase().indexOf(q.toLowerCase()) > -1) result = true;
          if(p.user.lastName.toLowerCase().indexOf(q.toLowerCase()) > -1) result = true;
          if(p.user.username.toLowerCase().indexOf(q.toLowerCase()) > -1) result = true;
        });


      });
      return result;

    };

  };

  $scope.filterFn = (pogInput) => {
    return true;
  };

  // Show Dialog with searching tips
  $scope.showFilterTips = ($event) => {

    let content = "The search bar can filter the listing of POGs using a number of special terms. ";
    content    += "<ul>";
    content    += "<li>Filter by tumour content: <code>tc>50 tc<40 tc=35</code></li>";
    content    += "<li>Filter by POG: <code>pog544</code></li>";
    content    += "<li>By ploidy: <code>diploid</code></li>";
    content    += "<li>By user involved: <code>bpierce</code>, <code>Brandon</code></li>";
    content    += "<li>By disease: <code>melanoma</code></li>";
    content    += "<li>By comparators: <code>BRCA</code>, <code>breast</code></li>";
    content    += "</ul>";

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('POG Searching Tips')
        .htmlContent(content)
        .ok('Got it!')
        .targetEvent($event)
    );

  };

  $scope.showGenomicDescription = ($event) => {
    let content = "<h4>The Report</h4>";
    content    += "<p>The Tumour Genome Analysis report provides a comprehensive description of the somatic genetic alterations present in a tumour. ";
    content    += "All genes in the genome are assessed for alterations of all types, including substitutions, deletions, gene fusions, amplification, and overexpression. ";
    content    += "Both known and novel alterations which affect genes of potential clinical relevance are included in the report. Germline variants are not generally included in this report.</p>";
    content    += "<hr>";


    content    += "<h4>Methods Overview</h4>";
    content    += "<p>The complete report is based on whole genome sequencing of tumour and matched normal DNA, and whole transcriptome sequencing of tumour RNA. ";
    content    += "Tumour and normal sequences are compared to the reference human genome to identify tumour-specific alterations including single nucleotide variants, small insertions and deletions, copy number changes, and structural variants such as translocations. ";
    content    += "Sequences are also assembled in a reference-independent manner to identify further structural alterations. ";
    content    += "Additionally, RNA sequences are used to measure expression of all genes, and genes with over and under-expression compared to reference tissues are identified. ";
    content    += "Somatic changes are cross-referenced to databases of therapeutic, diagnostic, prognostic, and biological information, pinpointing the alterations most likely to have clinical relevance. ";
    content    += "This comprehensive tumour description is expert reviewed by a Genome Analyst, highlighting potential driver mutations, providing pathway context, interpreting results in tumour type context, and refining potential therapeutic targets.</p>";
    content    += "<hr>";


    content    += "<h4>Detailed Methods</h4>";
    content    += "<p>Genome status: Tumour content and ploidy are determined based on expert review of copy number and allelic ratios observed across all chromosomes in the tumour.</p>";

    content    += "<p>Tissue comparators and expression comparisons: The most appropriate normal tissue and tumour tissues are chosen for expression comparisons based on the tumour type and observed correlation with tissue data sets. ";
    content    += "If no appropriate tissue comparator is available, for instance for rare tumours, an average across all tissues is used. ";
    content    += "Fold change in expression is calculated compared to the normal tissue, and percentile expression is calculated compared to all tumour samples of that disease type. ";
    content    += "Outlier expression refers to genes with very high or very low expression compared to what is seen in other cancers of that type.</p>";

    content    += "<p>Microbial content: Sequences are compared to databases of viral, bacterial and fungal sequences in addition to the human genome. ";
    content    += "The microbial species is reported if observed levels are suggestive of microbial presence in the tumour sample. ";
    content    += "Specific viral integration sites are reported if identified in genomic DNA sequence.</p>";

    content    += "<p>Mutation signature: The pattern of specific base changes and base context of single nucleotide variants in the tumour, referred to as the mutation signature, is computed and compared to patterns previously observed in a wide variety of tumour types. ";
    content    += "Signatures that suggest a particular mutation etiology, such as exposure to a specific mutagen, are noted.</p>";

    content    += "<p>Mutation burden: The number of protein coding alterations of each type, including both known and novel events, are totaled and compared to other tumours of a similar type. ";
    content    += "For SNVs and indels, this includes data from TCGA, while for structural variants, comparisons are only made among POG samples due to differences in how these variants are identified in TCGA.</p>";

    content    += "<p>Key genomic and transcriptomic alterations: The subset of alterations which have a previously described effect on genes of clinical or biological significance are summarized, ";
    content    += "with details of significance provided in the Detailed Genomic Analysis section, and details of the exact alteration provided in the section of the report corresponding to that mutation type. ";
    content    += "Additional alterations in these genes, which have not been previously observed and do not have an inferred functional effect, are variants of uncertain significance (VUS), and are only listed in the subsequent sections of the report. ";
    content    += "Alterations in genes which are not associated with cancer, cancer pathways, or therapeutics, are not usually included in the genomic report but are available upon request to the Genome Sciences Centre.</p>";

    content    += "<p>Genomic events with potential therapeutic association: The subset of alterations with specific therapeutic associations are identified using the Genome Sciences Centre's expert curated Knowledgebase, ";
    content    += "which integrates information from sources including cancer databases, drug databases, clinical tests, and the literature. ";
    content    += "Associations are listed by the level of evidence for the use of that drug in the context of the observed alteration, ";
    content    += "including those that are approved in this or other cancer types, and those that have early clinical or preclinical evidence.</p>";
    content    += "<hr>";

    if(isExternalMode) {
      content    += "<h4>Field Descriptions</h4>";
      content    += "<p>Patient: Study identification code</p>";
      content    += "<p>Alternate Identifier: Alternative study identifier if enrolled in another genomics study (e.g. COMPARISON or PROFYLE IDs)";
      content    += "<p>Disease: Primary diagnosis</p>";
      content    += "<p>Physician: Most responsible clinician for receiving the genomic report</p>";
      content    += "<p>Age: Status at enrollment</p>";
      content    += "<p>Status: Status of the report</p>";
      content    += "<hr>";
    }

    content    += "<p>The Tumour Genome Analysis report is developed by Canada's Michael Smith Genome Sciences Centre, part of the BC Cancer Agency. ";
    content    += "Contents should be regarded as purely investigational and are intended for research purposes only.</p>";

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('About Genomic Reports')
        .htmlContent(content)
        .ok('Close')
        .targetEvent($event)
    );

  };


}]);
