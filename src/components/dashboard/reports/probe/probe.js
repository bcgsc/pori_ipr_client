app.controller('controller.dashboard.reports.probe', ['_', '$q', '$scope', 'api.pog_analysis_report', 'reports', '$mdDialog', 'user', '$userSettings',  (_, $q, $scope, $report, reports, $mdDialog, user, $userSettings) => {

  $scope.reports = reports;
  $scope.archived = false;
  $scope.nonproduction = false;
  $scope.loading = false;

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

  $scope.filter ={
    currentUser: ($userSettings.get('probeReportListCurrentUser') === undefined) ? true : $userSettings.get('probeReportListCurrentUser'),
    query: null
  };

  if($userSettings.get('probeReportListCurrentUser') === undefined) $userSettings.save('probeReportListCurrentUser', true);

  $scope.numReports = (state) => {
    return _.filter(reports, {state: state}).length;
  };

  $scope.$watch('filter.currentUser', (newVal, oldVal) => {
    // Ignore onload message
    if(JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('probeReportListCurrentUser', newVal);

  });

  $scope.refreshList = () => {

    let states = [];
    _.each($scope.states, (v,k) => {
      if(v) states.push(k);
    });

    $scope.loading = true;
    $report.all({all: !$scope.filter.currentUser, query: $scope.filter.query, role: $scope.filter.role, states: _.join(states, ','), type: 'probe'}).then(
      (result) => {
        $scope.loading = false;
        $scope.reports = reports = result;
        associateUsers();
      },
      (err) => {
        console.log('Unable to get pogs', err);
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

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('POG Searching Tips')
        .htmlContent("The search bar can filter the listing of POGs using a number of special terms. <ul><li>Filter by tumour content: <code>tc>50 tc<40 tc=35</code></li><li>Filter by POG: <code>pog544</code></li><li>By tumour type: <code>brca</code></li><li>By ploidy: <code>diploid</code></li><li>By user involved: <code>bpierce</code>, <code>Brandon</code></li> <li>By disease: <code>melanoma</code></li> </ul>")
        .ok('Got it!')
        .targetEvent($event)
    );

  };


}]);
