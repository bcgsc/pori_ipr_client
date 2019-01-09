class GenomicAterations {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
    this.api = `${CONFIG.ENDPOINTS.API}/POG`;
  }
  
  /**
   * Retrieve all POGs from API that user can access
   */
  async all(POGID, report) {
    const resp = await this.$http.get(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicAlterationsIdentified`,
    );
    return resp.data;
  }
  
  /*
   * Get an Identified Genomic Alteration
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  async id(POGID, report, ident) {
    const resp = await this.$http.get(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicAlterationsIdentified/${ident}`,
    );
    return resp.data;
  }
  
  /*
   * Update an Identified Genomic Alteration
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   */
  async update(POGID, report, ident, gai) {
    const resp = await this.$http.put(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicAlterationsIdentified/${ident}`,
       gai,
    );
    return resp.data;
  }

  /*
   * Create an Identified Genomic Alteration
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   */
  async create(POGID, report, alteration) {
    const resp = await this.$http.post(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicAlterationsIdentified/`,
      alteration,
    );
    return resp.data;
  }
  
  /*
   * Remove an Identified Genomic Alteration
   *
   * @param string POGID - POGID, eg POG129
   * @param string ident - UUID4 identity string for entry
   *
   */
  async remove(POGID, report, ident, comment, cascade = false) {
    await this.$http.delete(
      `${this.api}/${POGID}/report/${report}/genomic/summary/genomicAlterationsIdentified/${ident}`,
      {
        data: {
          comment,
          cascade,
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });
    return true;
  }
}

export default GenomicAterations;
