/*
 * BCGSC - IPR-Client PUBMED Central API
 *
 * This API factory implements the IPR-API. Calls to and from the API are
 * managed through this construct.
 *
 */
app.factory('api.pubmed', ['_', '$http', '$q', (_, $http, $q) => {
  
  // https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&id=25081398
  const api = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&rettype=abstract&id=';

  
  let $pubmed = {};
  
  
  /*
   * Get All POGS
   *
   * Retrieve all POGs from API that user can access
   *
   */
  $pubmed.article = (pmid) => {
    return $q((resolve, reject) => {
      
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = (stateChange) => {
        
        // Wait until readyState === 4 (request finished)
        if(xhttp.readyState === 4) {
          
          if(xhttp.status >= 200 && xhttp.status < 400) {
            resolve(JSON.parse(xhttp.responseText).result[parseInt(pmid, 10)]);
          } else {
            reject(xhttp);
          } 
          
        }
        
      };
      
      xhttp.open('GET', api + pmid, true);
      xhttp.send();
      
    });
    
  }
  
  return $pubmed;
  
}]);
