app.controller('controller.dashboard.listing', ['_', '$q', '$scope', 'api.pog', 'pogs', '$mdDialog', 'user',  (_, $q, $scope, $pog, pogs, $mdDialog, user) => {

  $scope.pogs = pogs;

  $scope.roles = [
    'bioinformatician',
    'analyst',
    'reviewer',
    'admin',
    'clinician'
  ];

  $scope.filter ={
    currentUser: true,
    query: null
  };


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
      if(pog.patientInformation.tumourType.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;
      
      // Ploidy Model
      if(pog.tumourAnalysis.ploidy.toLowerCase().indexOf(query.toLowerCase()) !== -1) result = true;
      
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

  }

  
}]);
