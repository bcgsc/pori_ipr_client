import { $http } from 'ngimport';

class GeneService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
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
