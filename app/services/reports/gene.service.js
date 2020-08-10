import { $http } from 'ngimport';

class GeneService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async update(report, geneName, gene) {
    const geneNameEncoded = encodeURIComponent(geneName);
    return $http.put(
      `${this.api}/${report}/genes/${geneNameEncoded}`,
      gene,
    );
  }
}

export default new GeneService();
