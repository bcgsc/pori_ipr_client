app.directive("iprReportState", ['$q', '_', ($q, _) => {

  return {
    restrict: 'EA',
    transclude: false,
    scope: {
      state: '=state',
    },
    templateUrl: 'ipr-report-state/ipr-report-state.html',
    link: (scope, element, attr) => {

      let parse = (state) => {
        if(state === 'nonproduction') return 'Non-Production/Test';
        if(state === 'ready') return 'Ready for analysis';
        if(state === 'presented') return 'Review/Presentation';
        if(state === 'active') return 'Analysis underway';
        if(state === 'archived') return 'Archived';
        if(state === 'signedoff') return 'Signed-off';
        if(state === 'reviewed') return 'Reviewed';
        if(state === 'uploaded') return 'Uploaded';
      };

      scope.parsedState = parse(scope.state);


    } // end link
  }; // end return

}]);
