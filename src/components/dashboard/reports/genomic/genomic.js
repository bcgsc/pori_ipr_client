app.controller('controller.dashboard.reports.genomic', ['_', '$q', '$rootScope', '$scope', 'api.pog_analysis_report', 'reports', '$mdDialog', 'user', '$userSettings', 'projects',  (_, $q, $rootScope, $scope, $report, reports, $mdDialog, user, $userSettings, projects) => {

  $scope.reports = reports = _.orderBy(reports, ['analysis.pog.POGID','createdAt'], ['asc','desc']);
  $scope.archived = false;
  $scope.nonproduction = false;
  $scope.loading = false;
  $scope.selectedProject = ($userSettings.get('selectedProject') === undefined) ? null : $userSettings.get('selectedProject');

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
  
  // Clinician Mode Override
  if($rootScope._clinicianMode) {
    $scope.states = {
      ready: false,
      active: false,
      presented: true,
      archived: false,
      nonproduction: false
    }
  }

  $scope.filter ={
    currentUser: ($userSettings.get('genomicReportListCurrentUser') === undefined) ? true : $userSettings.get('genomicReportListCurrentUser'),
    query: null
  };

  if($userSettings.get('genomicReportListCurrentUser') === undefined) $userSettings.save('genomicReportListCurrentUser', true);

  $scope.numReports = (state) => {
    return _.filter(reports, {state: state}).length;
  };

  $scope.$watch('filter.currentUser', (newVal, oldVal) => {
    // Ignore onload message
    if(JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('genomicReportListCurrentUser', newVal);
  });
  
  $scope.$watch('selectedProject', (newVal, oldVal) => {
    if(JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('selectedProject', newVal);
  });

  $scope.refreshList = () => {
    let states = [];
    _.each($scope.states, (v,k) => {
      if(v) states.push(k);
    });
    $scope.loading = true;
    $report.all({all: !$scope.filter.currentUser, query: $scope.filter.query, role: $scope.filter.role, states: _.join(states, ','), type: 'genomic', project: $scope.selectedProject }).then(
      (result) => {
        $scope.loading = false;
        $scope.reports = reports = result;
        $scope.reports = reports = _.orderBy(result, ['analysis.pog.POGID','createdAt'], ['asc','desc']);
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

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('POG Searching Tips')
        .htmlContent("The search bar can filter the listing of POGs using a number of special terms. <ul><li>Filter by tumour content: <code>tc>50 tc<40 tc=35</code></li><li>Filter by POG: <code>pog544</code></li><li>By ploidy: <code>diploid</code></li><li>By user involved: <code>bpierce</code>, <code>Brandon</code></li> <li>By disease: <code>melanoma</code></li> <li>By comparators: <code>BRCA</code>, <code>breast</code></li></ul>")
        .ok('Got it!')
        .targetEvent($event)
    );

  };


}]);
