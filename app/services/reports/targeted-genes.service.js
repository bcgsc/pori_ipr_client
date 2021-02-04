import { $http } from 'ngimport';

class TargetedGenesService {
  constructor() {
    this.api = `${window._env_.API_BASE_URL}/reports`;
  }

  async getAll(report) {
    const { data } = await $http.get(
      `${this.api}/${report}/probe-results`,
    );
    return data;
  }

  async update(report, eventId, comments) {
    const data = await $http.put(
      `${this.api}/${report}/probe-results/${eventId}`,
      comments,
    );
    return data;
  }
}

export default new TargetedGenesService();
