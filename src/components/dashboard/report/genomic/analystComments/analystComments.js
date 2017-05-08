app.controller('controller.dashboard.report.genomic.analystComments', 
  ['_', '$q', '$scope', '$mdDialog', '$mdToast', '$sce', 'api.pog', 'api.summary.analystComments', 'pog', 'report', 'comments',
  (_, $q, $scope, $mdDialog, $mdToast, $sce, $pog, $comments, pog, report, analystComments) => {

  $scope.pog = pog;
  $scope.analystComments = (analystComments === null) ?  "" : analystComments.comments;
  $scope.commentsHTML = $sce.trustAsHtml($scope.analystComments);
  $scope.comments = analystComments;


  // Sign The comments
  $scope.sign = (role) => {

    // Send signature to API
    $comments.sign(pog.POGID, report.ident, role).then(
      (result) => {
        $scope.comments = result;
      }
    )
  };

  // Sign The comments
  $scope.revokeSign = (role) => {

    // Send signature to API
    $comments.revokeSign(pog.POGID, report.ident, role).then(
      (result) => {
        $scope.comments = result;
      }
    )
  };


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
        
        scope.analystComments = analystComments;

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
          
          $comments.update(pog.POGID, report.ident, updatedComment).then(
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
      $scope.commentsHTML = $sce.trustAsHtml(result.comment.comments);

      // Display Message from Hiding
      $mdToast.show($mdToast.simple().textContent(result.message));
    }, (error) => {
      $mdToast.show($mdToast.simple().textContent(error));
    });
  }
  
}]);
