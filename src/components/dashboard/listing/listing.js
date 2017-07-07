app.controller('controller.dashboard.listing', ['_', '$q', '$scope', '$state', 'api.pog', 'pogs', '$mdDialog', 'user', '$userSettings',  (_, $q, $scope, $state, $pog, pogs, $mdDialog, user, $userSettings) => {

  $state.go('dashboard.listing.genomic');

  /*
  $scope.pogs = pogs;
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

  $scope.filter ={
    currentUser: ($userSettings.get('pogListCurrentUser') === undefined) ? true : $userSettings.get('pogListCurrentUser'),
    query: null
  };

  if($userSettings.get('pogListCurrentUser') === undefined) $userSettings.save('pogListCurrentUser', true);

  $scope.numPogs = (state) => {
    let i = 0;
    let pogs = [];
    _.forEach($scope.pogs, (p) => {
      let pr = _.filter(p.analysis_reports, {state: state}).length;
      if(pr > 0 && pogs.indexOf(p.POGID)) pogs.push(p.POGID);
    });
    return pogs.length;
  };

  $scope.$watch('filter.currentUser', (newVal, oldVal) => {
    // Ignore onload message
    if(JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('pogListCurrentUser', newVal);

  });

  $scope.refreshList = () => {
    $scope.loading = true;
    $pog.all({all: !$scope.filter.currentUser, query: $scope.filter.query, role: $scope.filter.role, archived: $scope.archived, nonproduction: $scope.nonproduction}).then(
      (result) => {
        $scope.loading = false;
        $scope.pogs = result;
        associateUsers();
      },
      (err) => {
        console.log('Unable to get pogs', err);
      }
    )
  };

  let associateUsers = () => {
    // Filter Users For a POG
    _.forEach($scope.pogs, (p, i) => {
      // Loop over pogusers
      $scope.pogs[i].myRoles = _.filter(p.POGUsers, {user: {ident: user.ident}});
    });
  };

  associateUsers();

  $scope.searchPogs = (state, query) => {
    
    return (pog) => {
      if(!query) query = "";

      // Define Return result
      let result = false;

      // Run over each split by space
      _.forEach(query.split(' '), (q) => {

        if(!_.find(pog.analysis_reports, {state: state})) return false;


        if(q.length === 0) return result = true;

        // Pog ID?
        if(pog.POGID.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        if(pog.patientInformation !== null && pog.patientInformation.tumourType && pog.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

        // Tumour Type & Ploidy Model
        //if(pog.patientInformation.tumourType && pog.patientInformation.tumourType.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;
        _.forEach(pog.analysis_reports, (r) => {
          if(!r.tumourAnalysis) return;
          if(r.tumourAnalysis && r.tumourAnalysis.ploidy.toLowerCase().indexOf(q.toLowerCase()) !== -1) result = true;

          // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
          if(q.toLowerCase().indexOf('tc>') !== -1) (r.tumourAnalysis.tumourContent > parseInt(_.last(q.split('>')))) ? result = true : null;
          if(q.toLowerCase().indexOf('tc<') !== -1) (r.tumourAnalysis.tumourContent < parseInt(_.last(q.split('<')))) ? result = true : null;
          if(q.toLowerCase().indexOf('tc=') !== -1) (r.tumourAnalysis.tumourContent === parseInt(_.last(q.split('=')))) ? result = true : null;
        });

        // Search Users
        _.forEach(pog.POGUsers, (p) => {
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
  */


}]);
