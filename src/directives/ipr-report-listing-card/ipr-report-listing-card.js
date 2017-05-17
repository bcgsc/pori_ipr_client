app.directive("iprReportListingCard", ['$q', '_', '$mdDialog', '$mdToast', '$state', ($q, _, $mdDialog, $mdToast, $state) => {


  return {
    restrict: 'E',
    transclude: false,
    scope: {
      report: '=report',
      pog: '=pog'
    },
    templateUrl: 'ipr-report-listing-card/ipr-report-listing-card.html',
    link: (scope, element, attr) => {

      let pog = scope.pog;
      let repot = scope.report;

      // Determine if probe/genomic available
      scope.checkProbeGenomic = (pog, type) => {
        return (_.find(pog.analysis_reports, {type: type})) ? true : false;
      };

      // Get Tumour Content
      scope.getTumourContent = (pog) => {
        let genomic = _.find(pog.analysis_reports, {type: 'genomic'});
        if(!genomic) return "N/A";
        return genomic.tumourAnalysis.tumourContent;
      };

      // Get Ploidy Model Content
      scope.getPloidy = (pog) => {
        let genomic = _.find(pog.analysis_reports, {type: 'genomic'});
        if(!genomic) return "N/A";
        return genomic.tumourAnalysis.ploidy;
      };

      // Get Report
      scope.getReport = (pog, type) => {
        return _.find(pog.analysis_reports, {type: type});
      };

      // Get Role
      scope.getRoleUser = (pog, role, resp) => {
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


    } // end link
  }; // end return

}]);
