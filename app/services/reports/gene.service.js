import { $http } from 'ngimport';

class GeneService {
  constructor() {
    this.api = `${CONFIG.ENDPOINTS.API}/reports`;
  }

  async update(report, geneName, gene) {
    return $http.put(
      `${this.api}/${report}/genes/${geneName}`,
      gene,
    );
  }
}

export default new GeneService();
