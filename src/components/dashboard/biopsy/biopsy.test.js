app.controller('controller.dashboard.biopsy.test', ['$q', '_', '$scope', '$http', ($q, _, $scope, $http) => {
  
  // Take request, send to requested URL
  $scope.req = {
    method: null,
    url: null,
    body: null,
    headers: null
  };
  
  $scope.request = () => {
    
    let headers = null;
    if($scope.req.headers !== null) {
      let header_pairs = $scope.req.headers.split(';');
  
      let headers = {};
  
      _.forEach(header_pairs, (h) => {
        let spl = h.split(':');
        headers[spl[0].trim()] = spl[1].trim();
      });
  
      console.log('headers', headers);
  
      let opts = {
        headers: headers
      };
    }
    
    $http({
      method: $scope.req.method,
      url: $scope.req.url,
      data: $scope.req.body,
      headers: headers
    }).then(
      (result) => {
        console.log(result.data);
        $scope.response = result.data;
      },
      (err) => {
        console.log(err);
        $scope.response = "Error! Look at console log for error response data";
      }
    )
    
  };
  
  
}]);