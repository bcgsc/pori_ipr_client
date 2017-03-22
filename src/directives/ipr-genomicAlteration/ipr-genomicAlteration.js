app.directive("iprGenomicAlteration", ['$q', '_', '$mdDialog', '$mdToast', ($q, _, $mdDialog, $mdToast) => {
  
  
  return {
    restrict: 'E',
    transclude: false,
    scope: {
      samples: '=samples',
      gene: '=gene',
      pog: '=pog',
      trigger: '='
    },
    templateUrl: 'ipr-genomicAlteration/ipr-genomicAlteration.html',
    link: (scope, element, attr) => {

      // Filter reference type
      scope.refType = (ref) => {
        if(ref.match(/^[0-9]{8}\#/)) {
          return 'pmid';
        }
        if(ref.match(/^(?:http(?:s)?:\/\/)?(?:[^\.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
          return 'link';
        } 
        return 'text';
      };
      
      // Prepend a link with http:// if necessary
      scope.prependLink = (link) => {
        return (link.indexOf('http://') == -1) ? 'http://' + link : link;
      };
      
      // Clean up PMIDs
      scope.cleanPMID = (pmid) => {
        return pmid.match(/^[0-9]{8}/)[0];
      };
      
      // Update entry icon clicked
      scope.updateRow = ($event, row) => {
        
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
          clickOutToClose: false,
          locals: {
            pog: scope.pog,
            gene: row,
            samples: scope.samples,
            rowEvent: 'update',
          },
          controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
         
        }).then((outcome) => {
          if(outcome) $mdToast.show($mdToast.simple().textContent(outcome));
            scope.trigger(true);
          },
          (error) => {
            $mdToast.show($mdToast.simple().textContent('No changes have been made'));
          }
        );
      };
      
      // Create new entry...
      scope.createRow = ($event, init) => {

        let gene = angular.copy(init);
        delete gene.reference;
        delete gene.evidence;
        delete gene.therapeuticContext;
        delete gene.effect;
        delete gene.association;
        delete gene.disease;

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/detailedGenomicAnalysis/alterations/alterations.edit.html',
          clickOutToClose: false,
          locals: {
            pog: scope.pog,
            gene: gene,
            samples: scope.samples,
            rowEvent: 'create'
          },
          controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit' // End controller
        });
      }
      
    } // end link
  }; // end return
  
}]);
