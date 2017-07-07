app.directive("iprReportListingCard", ['$q', '_', '$mdDialog', '$mdToast', '$state', ($q, _, $mdDialog, $mdToast, $state) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      report: '=report',
      pog: '=pog',
      state: '@state'
    },
    templateUrl: 'ipr-report-listing-card/ipr-report-listing-card.html',
    link: (scope, element, attr) => {

      let pog = scope.pog;

      // Determine if probe/genomic available
      scope.checkProbeGenomic = (pog, type) => {
        return (scope.report.type === type);
      };

      // Get Tumour Content
      scope.getTumourContent = (pog) => {
        if(scope.report.type !== 'genomic') return "N/A";
        return scope.report.tumourAnalysis.tumourContent;
      };

      // Get Ploidy Model Content
      scope.getPloidy = (pog) => {
        if(scope.report.type !== 'genomic') return "N/A";
        return scope.report.tumourAnalysis.ploidy;
      };

      // Get Report
      scope.getReport = (pog, type) => {
        return (scope.report.type === type);
      };

      // Get Role
      scope.getRoleUser = (pog, role, resp) => {
        let user =  _.find(scope.report.users, {role: role});

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


    } // end link
  }; // end return

}]);
