app.controller('controller.dashboard.report.genomic.analystComments', 
  ['_', '$q', '$scope', '$mdDialog', '$mdToast', '$sce', 'api.pog', 'pog', 'comments',
  (_, $q, $scope, $mdDialog, $mdToast, $sce, $pog, pog, analystComments) => {
  
  console.log('Analyst Comments Loaded');
  
  $scope.pog = pog;
  $scope.analystComments = (analystComments === null) ?  "" : analystComments.comments;
  $scope.commentsHTML = $sce.trustAsHtml($scope.analystComments);

  // Editor Update Modal
  $scope.updateComments = ($event) => {
    
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/analystComments/analystComments.edit.html',
      locals: {
        pog: pog
      },
      clickOutToClose: false,
      controller: ['$q', '_', '$scope', '$mdDialog', '$timeout', 'api.summary.analystComments', ($q, _, scope, $mdDialog, $timeout, $comments) => {
        
        scope.analystComments = $scope.analystComments;

        // Cancel Dialog
        scope.cancel = () => {
          $mdDialog.cancel('Canceled Edit - No changes made.');
        };
        
        // Update Details
        scope.update = (f) => {
          
          if(f.$invalid) {
            f.$setDirty();
            angular.forEach(f.$error, (field) => {
              angular.forEach(field, (errorField) => {
                errorField.$setTouched();
              });
            });
            return;
          }
          
          let updatedComment = {'comments': scope.analystComments.comments};

          console.log('Updating value with: ', updatedComment);
          
          $comments.update(pog.POGID, updatedComment).then(
            (result) => {
              $mdDialog.hide({message: 'Entry has been updated', comment: updatedComment});
            },
            (error) => {
              alert('Unable to update. See console');
              console.log(error);
            }
          );
          
        } // End update
      }]
    }).then((result) => {
      // Update current page content
      $scope.analystComments = result.comment;
      
      // Display Message from Hiding
      $mdToast.show($mdToast.simple().textContent(result.message));
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }
  
}]);
