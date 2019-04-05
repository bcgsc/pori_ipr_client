class PathwayAnalysisService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }

  async get(pogID, report) {
    const { data } = await this.$http.get(
      `${this.api}/${pogID}/report/${report}/genomic/summary/pathwayAnalysis`,
    );
    return data;
  }


  /*
   * Update Pathway Analysis for this POG
   *
   * @param string POGID - POGID, eg POG129
   * @param string XMLbody - text string of SVG
   *
   */
  async update(pogID, report, summary) {
    const { data } = await this.$http.put(
      `${this.api}/${pogID}/report/${report}/genomic/summary/pathwayAnalysis`,
      summary,
    );
    return data;
  }
}

export default PathwayAnalysisService;
