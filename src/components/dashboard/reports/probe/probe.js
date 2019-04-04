app.controller('controller.dashboard.reports.probe', ['_', '$q', '$scope',
  'api.pog_analysis_report', 'reports', '$mdDialog', 'user', '$acl', 'isExternalMode',
  (_, $q, $scope, $report, reports, $mdDialog, user, $acl, isExternalMode) => {
  $scope.reports = reports;
  $scope.archived = false;
  $scope.nonproduction = false;
  $scope.loading = false;
  $scope.externalMode = isExternalMode;

  $scope.roles = [
    'bioinformatician',
    'analyst',
    'reviewer',
    'admin',
    'clinician'
  ];

  $scope.states = {
    uploaded: true,
    signedoff: true,
    reviewed: false,
    nonproduction: false
  };

  if(isExternalMode) {
    $scope.states.reviewed = true;
    $scope.states.uploaded = false;
    $scope.states.signedoff = false;

    $scope.reports = reports.reports;
    $scope.pagination = {
      offset: 0,
      limit: 25,
      total: reports.total
    };
  }

  $scope.filter ={
    query: null
  };

  $scope.numReports = (state) => {
    return _.filter(reports, {state: state}).length;
  };

  $scope.refreshList = () => {

    let states = [];
    _.each($scope.states, (v,k) => {
      if(v) states.push(k);
    });

    $scope.loading = true;
    $report.all({all: true, query: $scope.filter.query, states: _.join(states, ','), type: 'probe'}).then(
      (result) => {
        $scope.loading = false;
        $scope.reports = reports = result;
      },
      (err) => {
        console.log('Unable to get pogs', err);
      }
    )
  };

  if (reports.length === 0) $scope.refreshList(); // Refresh list if no reports (in case page loaded through url and not navigation)

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

        if(report.patientInformation !== null && report.patientInformation.tumourType && report.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Tumour Type & Ploidy Model
        //if(pog.patientInformation.tumourType && pog.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;
        if(!report.tumourAnalysis) return;
        if(report.tumourAnalysis && report.tumourAnalysis.ploidy && report.tumourAnalysis.ploidy.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
        if(q.toLowerCase().indexOf('tc>') !== -1) (report.tumourAnalysis.tumourContent > parseInt(_.last(q.split('>')))) ? result = true : null;
        if(q.toLowerCase().indexOf('tc<') !== -1) (report.tumourAnalysis.tumourContent < parseInt(_.last(q.split('<')))) ? result = true : null;
        if(q.toLowerCase().indexOf('tc=') !== -1) (report.tumourAnalysis.tumourContent === parseInt(_.last(q.split('=')))) ? result = true : null;

        // Search Users
        _.forEach(report.users, (p) => {
          if(p.user.firstName.indexOf(q) > -1) result = true;
          if(p.user.lastName.indexOf(q) > -1) result = true;
          if(p.user.username.indexOf(q) > -1) result = true;
        });


      });

      return result;

    };

  };

  $scope.filterFn = (pogInput) => {
    console.log(pogInput);
    return true;
  };

  // Show Dialog with searching tips
  $scope.showFilterTips = ($event) => {
    let content = "The search bar can filter the listing of POGs using a number of special terms. ";
    content    += "<li>Filter by POG: <code>pog544</code></li>";
    content    += "<li>By disease: <code>melanoma</code></li></ul>";

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('POG Searching Tips')
        .htmlContent(content)
        .ok('Close')
        .targetEvent($event)
    );

  };

  $scope.showProbeDescription = ($event) => {
    let content = "<h4>The Report</h4>";
    content    += "<p>The Targeted Gene Report (TGR) provides results from a rapid analysis pipeline designed to identify ";
    content    += "specific somatic alterations in a select set of cancer-associated genes and gene fusion events. ";
    content    += "This rapid analysis is not a complete description of aberrations present in the tumour genome. ";
    content    += "The absence of a specific mutation in this report is not a guarantee that the mutation is not present in the patient's tumour. ";
    content    += "Germline variants are not included in this report.</p>";
    content    += "<hr>";

    content    += "<h4>Test Method</h4>";
    content    += "<p>In the TGR, whole genome and whole transcriptome sequence reads are computationally queried to identify events matching ";
    content    += "a specific list of known cancer-related aberrations. A subset of genes is examined for specific events which include, ";
    content    += "but are not limited to, individual gene mutations such as hotspot mutations in KRAS, BRAF and PIK3CA, ";
    content    += "and gene-pair fusions such as BCR-ABL1, EML4-ALK, and CCDC6-RET. ";
    content    += "Genome and transcriptome sequence data are queried for individual gene mutations; only transcriptome data are queried for gene fusion events.</p>";
    content    += "<hr>";

    content    += "<h4>Reporting of information of Potential Clinical Relevance</h4>";
    content    += "<p>The TGR incorporates results from published peer-reviewed studies and other publicly available information through our in-house Knowledgebase - ";
    content    += "a curated database of cancer-associated genes and genomic alterations. ";
    content    += "Reported associations may include those of potential biological, diagnostic, prognostic and therapeutic significance. ";
    content    += "Therapeutic associations of potential clinical benefit (or potential lack of clinical benefit) are derived from public data and are not independently verified.</p>";

    content    += "<p>This report will generally be followed by a final report, "
    content    += "which will provide a more comprehensive description of both previously observed and novel aberrations.</p>";
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

    content    += "<p>The TGR is developed by Canada's Michael Smith Genome Sciences Centre, part of the British Columbia Cancer Agency. ";
    content    += "Contents should be regarded as purely investigational and are intended for research purposes only.</p>";

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('About Targeted Gene Reports')
        .htmlContent(content)
        .ok('Close')
        .targetEvent($event)
    );

  };


}]);
