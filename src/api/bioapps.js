/*
 * BCGSC - IPR-Client User API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.bioapps', ['_', '$http', '$q', (_, $http, $q) => {
  
  const api = 'http://bioappsdev01:8104';
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJncm91cHMiOlsiZ3NjX2VtcGxveWVlIiwiUE9HIiwic2VxZGV2IiwiamlyYS11c2VycyIsImJpb2Z4Z3JwIiwidHVtb3VyX2NoYXJhY3Rlcml6YXRpb24iLCJTb2NpYWwgQ29tbWl0dGVlIiwiMXN0Zmxvb3IiLCJHU0NfQ09JX0FsbCIsIkdTQ19DT0lfUmVzZWFyY2hlciIsIlBPR2FuYWx5c2lzIiwiR1NDX1dlbGxuZXNzIiwiYmFtYm9vLWFkbWluIiwiZGV2X3N1cHBvcnQiXSwic3ViIjoiYnBpZXJjZSIsImlhdCI6MTUwNTc1NTA0OCwiZXhwIjoxNTA1ODQxNDQ4fQ.cuwFPEdkk3URFFDSTY2sbi5VbjUSsGM5gt4rEPAAVRuwl-t828BwtPb8IuLNjnSfj5dFwL8eX6b8kBzdX-UcMA';
  
  let $bioapps = {};
  
  
  /**
   * Get sample information from LIMS
   *
   * @param pogs
   * @returns {*}
   */
  $bioapps.cancer_goup = () => {
    return $q((resolve, reject) => {
      
      
      $http({
        method: 'GET',
        url: api + '/cancer_group',
        headers: {
          'x-token': token,
          Authorization: undefined,
          'Content-Type': 'application/json'
        },
      })
        .then((result) => {
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to get BioApps Cancer Group result', err);
          reject(err);
        });
      /*
      $http.get(api + '/cancer_group', {headers: {"X-Token": token, Authorization: undefined}}).then(
        (result) => { 
          resolve(result.data);
        })
        .catch((err) => {
          console.log('Failed to get BioApps Cancer Group result', err);
          reject(err);
        });
      */
      
    });
  };
  
  return $bioapps;
  
}]);
