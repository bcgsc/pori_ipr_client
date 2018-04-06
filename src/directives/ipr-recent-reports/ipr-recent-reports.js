app.directive("iprRecentReports", ['$q', '_', '$rootScope', '$state', '$interval', '$mdToast', 'api.recentReports', ($q, _, $rootScope, $state, $interval, $mdToast, $recent) => {
  
  return {
    restrict: 'E',
    transclude: false,
    templateUrl: 'ipr-recent-reports/ipr-recent-reports.html',
    link: (scope, element, attr) => {
  
      // Local reports collection
      scope.reports = [];
  
      $rootScope.$on('$stateChangeSuccess', (e, toState, toParams, fromState, fromParams) => {
    
        if(toState.name.match(/^(dashboard\.reports\.pog\.report)\.(genomic|probe)\.([A-z0-9\.]{2,})$/)) {
          findOrCreate(toParams.analysis_report, toState.name);
        }
    
      });
  
      /**
       * Remove the selected recent report entry
       *
       * @param {string} report - The ident string of the report to be removed
       */
      scope.remove = (i) => {
        
        $recent.remove(scope.reports[i].ident)
          .then(() => {
            scope.reports.splice(i,1);
          })
          .catch((err) => {
            console.log(err);
            $mdToast.showSimple('Failed to remove the recent report entry.');
          });
        
      };
  
      scope.goTo = (i) => {
        $state.go(scope.reports[i].state, {analysis_report: scope.reports[i].report.ident, POG: scope.reports[i].report.pog.POGID});
        
      };
      
      // Get all at startup
      $recent.all()
        .then((result) => {
          scope.reports = result;
        })
        .catch((err) => {
          $mdToast.showSimple('Failed to get list of recent reports.');
        });
      
      /**
       * Find or Create Report Entry
       *
       * @param {string} report - Report Ident string
       * @param {string} state - Current state name
       */
      let findOrCreate = (report, state) => {
    
        let index = _.findIndex(scope.reports, {report: {ident: report}});
  
        // Report not yet in try
        if(index < 0) {
          $recent.addOrUpdate(report, state)
            .then((result) => {
              scope.reports.push(result);
            })
            .catch((err) => {
              $mdToast.showSimple('Failed to add report to recent list');
            });
        }
    
        // Report in tray, update!
        if(index > -1) {
          $recent.addOrUpdate(report, state)
            .then((result) => {
              scope.reports[index] = result;
            })
            .catch((err) => {
              $mdToast.showSimple('Failed to add report to recent list');
            });
        }
        
      };
      
    } // end link
  } // end return
  
}]);
