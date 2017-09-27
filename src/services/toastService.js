app.factory('toastService', ['$mdToast', ($mdToast) => {
  
  
  function serverError(errorMessage) {
    
    this.message = errorMessage;
    
    this.toastOpen = false;
    
    if(this.toastOpen) return;
    
    $mdToast.show({
      templateUrl: 'views/toast.html',
      locals: {
        message: this.message
      },
      hideDelay: 0,
      position: 'bottom left',
      controller: ['$scope', '$mdToast', 'message', ($scope, $mdToast, message) => {
        $scope.message = message;
        
        $scope.class_style = "request-error";
        
        this.toastOpen = true;
        
        $scope.closeToast = () => {
          $mdToast.hide()
            .then(() => {
              this.toastOpen = false;
            });
        };
      }]
    })
    
  }
  
  return {
    message: '',
    serverError: serverError
  }
  
}]);