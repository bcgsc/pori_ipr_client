app.controller('controller.dashboard.listing', ['_', '$q', '$scope', 'api.pog', 'pogs', '$mdDialog', 'user', '$userSettings',  (_, $q, $scope, $pog, pogs, $mdDialog, user, $userSettings) => {

  $scope.pogs = pogs;

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


  $scope.$watch('filter.currentUser', (newVal, oldVal) => {
    // Ignore onload message
    if(JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    $userSettings.save('pogListCurrentUser', newVal);

  });

  $scope.refreshList = () => {
    $pog.all({all: !$scope.filter.currentUser, query: $scope.filter.query, role: $scope.filter.role}).then(
      (result) => {
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

  $scope.searchPogs = (query) => {
    
    return (pog) => {
      
      if(!query) return true;
      
      // Rever to false return
      let result = false;
      
      // Pog ID?
      if(pog.POGID.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;
      
      // Tumour Type
      //if(pog.patientInformation.tumourType && pog.patientInformation.tumourType.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;
      
      // Ploidy Model
      //if(pog.tumourAnalysis && pog.tumourAnalysis.ploidy.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;
      
      // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
      if(query.toLowerCase().indexOf('tc>') !== -1) (pog.tumourAnalysis.tumourContent > parseInt(_.last(query.split('>')))) ? result = true : null;
      if(query.toLowerCase().indexOf('tc<') !== -1) (pog.tumourAnalysis.tumourContent < parseInt(_.last(query.split('<')))) ? result = true : null;
      if(query.toLowerCase().indexOf('tc=') !== -1) (pog.tumourAnalysis.tumourContent == parseInt(_.last(query.split('=')))) ? result = true : null;
      
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
        .htmlContent("The search bar can filter the listing of POGs using a number of special terms. <ul><li>Filter by tumour content: <code>tc>50 tc<40 tc=35</code></li><li>Filter by POG: <code>pog544</code></li><li>By tumour type: <code>brca</code></li><li>By ploidy: <code>diploid</code></li></ul>")
        .ok('Got it!')
        .targetEvent($event)
    );

  };

  // Check for TA, Ploidy


  // Determine if probe/genomic available
  $scope.checkProbeGenomic = (pog, type) => {
    return (_.find(pog.analysis_reports, {type: type})) ? true : false;
  };

  // Get Tumour Content
  $scope.getTumourContent = (pog) => {
    let genomic = _.find(pog.analysis_reports, {type: 'genomic'});
    if(!genomic) return "N/A";
    return genomic.tumourAnalysis.tumourContent;
  };

  // Get Ploidy Model Content
  $scope.getPloidy = (pog) => {
    let genomic = _.find(pog.analysis_reports, {type: 'genomic'});
    if(!genomic) return "N/A";
    return genomic.tumourAnalysis.ploidy;
  };

  // Get Report
  $scope.getReport = (pog, type) => {
    return _.find(pog.analysis_reports, {type: type});
  };

  // Get Role
  $scope.getRoleUser = (pog, role, resp) => {
    let user =  _.find(pog.POGUsers, {role: role});

    if(!user) return null;

    switch(resp) {
      case 'name':
        return user.user.firstName + ' ' + user.user.lastName;
        break;
      case 'username':
        return user.user.username;
        break;
    }
  };


}]);
