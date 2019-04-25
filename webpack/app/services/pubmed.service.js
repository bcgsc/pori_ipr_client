class PubmedService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&rettype=abstract&id=';
  }

  /**
   * Retrieve a specified pubmed article
   * @param {Number} pmid - pubmed identifier
   * @return {Promise} Result of API call
   * @throws {ErrorType} Thrown when API call fails
   */
  async article(pmid) {
    const { data } = await this.$http.get(this.api);
    return data[pmid];
  }
}
  
export default PubmedService;
