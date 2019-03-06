import template from './probe.pug';

const bindings = {
  reports: '<',
  user: '<',
  isExternalMode: '<',
};

class ProbeComponent {
  /* @ngInject */
  constructor($rootScope, $scope, ReportService, $mdDialog, UserSettingsService, AclService) {
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.ReportService = ReportService;
    this.$mdDialog = $mdDialog;
    this.UserSettingsService = UserSettingsService;
    this.AclService = AclService;
    this.archived = false;
    this.nonproduction = false;
    this.loading = false;
    this.roles = [
      'bioinformatician',
      'analyst',
      'reviewer',
      'admin',
      'clinician',
    ];
    this.states = {
      uploaded: true,
      signedoff: true,
      reviewed: false,
      nonproduction: false,
    };
  }

  async $onInit() {
    if (this.isExternalMode) {
      this.states.reviewed = true;
      this.states.uploaded = false;
      this.states.signedoff = false;

      this.reports = this.reports;
      this.pagination = {
        offset: 0,
        limit: 25,
        total: this.reports.total,
      };
    }

    this.filter = {
      query: null,
    };
  }

  numReports(state) {
    return this.reports.filter(((report) => {
      return report.state === state;
    })).length;
  }

  async refreshList() {
    this.loading = true;
    const states = [];

    Object.entries(this.states).forEach((entries) => {
      const key = entries[0];
      const value = entries[1];
      if (value) {
        states.push(key);
      }
    });

    const opts = {
      all: !this.filter.currentUser,
      query: this.filter.query,
      states: states.join(),
      type: 'probe',
    };
    const resp = await this.ReportService.allFiltered(opts);
    this.loading = false;
    this.reports = _.orderBy(resp, ['analysis.pog.POGID', 'createdAt'], ['asc', 'desc']);
    // Filter Users For a POG
    this.reports.forEach((r, i) => {
      // Loop over pogusers
      this.reports[i].myRoles = r.users.filter((user) => {
        return user.ident === this.user.ident;
      });
    });
    this.$scope.$digest();
  }

  /* eslint-disable-next-line class-methods-use-this */
  searchPogs(state, query) { // This should be reworked, dunno what's going on here really
    return (report) => {
      // Define Return result
      let result = false;
      if (!query) {
        query = '';
        result = true;
      }
      // Run over each split by space
      query.split(' ').forEach((q) => {
        if (report.state !== state) {
          result = false;
          return null;
        }
        if (q.length === 0) {
          result = true;
          return null;
        }
        // Pog ID?
        if (report.analysis.pog.POGID.toLowerCase().includes(q.toLowerCase())) {
          result = true;
        }
        // Tumour Type
        if (report.patientInformation && report.patientInformation.tumourType
          && report.patientInformation.tumourType.toLowerCase().includes(q.toLowerCase())) {
          result = true;
        }
        // Tumour Type & Ploidy Model
        if (!report.tumourAnalysis) {
          return null;
        }
        if (report.tumourAnalysis && report.tumourAnalysis.ploidy
          && report.tumourAnalysis.ploidy.toLowerCase().includes(q.toLowerCase())) {
          result = true;
        }
        // Comparators
        if (report.tumourAnalysis && report.tumourAnalysis.diseaseExpressionComparator
          && report.tumourAnalysis.diseaseExpressionComparator.toLowerCase().includes(q.toLowerCase())) {
          result = true; // Disease
        }
        if (report.tumourAnalysis && report.tumourAnalysis.normalExpressionComparator
          && report.tumourAnalysis.normalExpressionComparator.toLowerCase().includes(q.toLowerCase())) {
          result = true; // Normal
        }
        // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
        if (q.toLowerCase().includes('tc>')
          && report.tumourAnalysis.tumourContent > parseInt(q.split('>').slice(-1).pop(), 10)) {
          result = true;
        }
        if (q.toLowerCase().includes('tc<')
          && report.tumourAnalysis.tumourContent < parseInt(q.split('<').slice(-1).pop(), 10)) {
          result = true;
        }
        if (q.toLowerCase().includes('tc=')
          && report.tumourAnalysis.tumourContent === parseInt(q.split('=').slice(-1).pop(), 10)) {
          result = true;
        }
        // Search Users
        report.users.forEach((p) => {
          if (p.user.firstName.toLowerCase().includes(q.toLowerCase())) {
            result = true;
          }
          if (p.user.lastName.toLowerCase().includes(q.toLowerCase())) {
            result = true;
          }
          if (p.user.username.toLowerCase().includes(q.toLowerCase())) {
            result = true;
          }
        });
      });
      return result;
    };
  }

  // Show Dialog with searching tips
  showFilterTips($event) {
    let content = 'The search bar can filter the listing of POGs using a number of special terms. ';
    content    += '<li>Filter by POG: <code>pog544</code></li>';
    content    += '<li>By disease: <code>melanoma</code></li></ul>';

    this.$mdDialog.show(this.$mdDialog.alert()
      .clickOutsideToClose(true)
      .title('POG Searching Tips')
      .htmlContent(content)
      .ok('Got it!')
      .targetEvent($event));
  }

  showProbeDescription($event) {
    let content = '<h4>The Report</h4>';
    content    += '<p>The Targeted Gene Report (TGR) provides results from a rapid analysis pipeline designed to identify ';
    content    += 'specific somatic alterations in a select set of cancer-associated genes and gene fusion events. ';
    content    += 'This rapid analysis is not a complete description of aberrations present in the tumour genome. ';
    content    += 'The absence of a specific mutation in this report is not a guarantee that the mutation is not present in the patient\'s tumour. ';
    content    += 'Germline variants are not included in this report.</p>';
    content    += '<hr>';

    content    += '<h4>Test Method</h4>';
    content    += '<p>In the TGR, whole genome and whole transcriptome sequence reads are computationally queried to identify events matching ';
    content    += 'a specific list of known cancer-related aberrations. A subset of genes is examined for specific events which include, ';
    content    += 'but are not limited to, individual gene mutations such as hotspot mutations in KRAS, BRAF and PIK3CA, ';
    content    += 'and gene-pair fusions such as BCR-ABL1, EML4-ALK, and CCDC6-RET. ';
    content    += 'Genome and transcriptome sequence data are queried for individual gene mutations; only transcriptome data are queried for gene fusion events.</p>';
    content    += '<hr>';

    content    += '<h4>Reporting of information of Potential Clinical Relevance</h4>';
    content    += '<p>The TGR incorporates results from published peer-reviewed studies and other publicly available information through our in-house Knowledgebase - ';
    content    += 'a curated database of cancer-associated genes and genomic alterations. ';
    content    += 'Reported associations may include those of potential biological, diagnostic, prognostic and therapeutic significance. ';
    content    += 'Therapeutic associations of potential clinical benefit (or potential lack of clinical benefit) are derived from public data and are not independently verified.</p>';

    content    += '<p>This report will generally be followed by a final report, '
    content    += 'which will provide a more comprehensive description of both previously observed and novel aberrations.</p>';
    content    += '<hr>';

    if (this.isExternalMode) {
      content    += '<h4>Field Descriptions</h4>';
      content    += '<p>Patient: Study identification code</p>';
      content    += '<p>Alternate Identifier: Alternative study identifier if enrolled in another genomics study (e.g. COMPARISON or PROFYLE IDs)';
      content    += '<p>Disease: Primary diagnosis</p>';
      content    += '<p>Physician: Most responsible clinician for receiving the genomic report</p>';
      content    += '<p>Age: Status at enrollment</p>';
      content    += '<p>Status: Status of the report</p>';
      content    += '<hr>';
    }

    content    += '<p>The TGR is developed by Canada\'s Michael Smith Genome Sciences Centre, part of the British Columbia Cancer Agency. ';
    content    += 'Contents should be regarded as purely investigational and are intended for research purposes only.</p>';

    this.$mdDialog.show(this.$mdDialog.alert()
      .clickOutsideToClose(true)
      .title('About Targeted Gene Reports')
      .htmlContent(content)
      .ok('Close')
      .targetEvent($event));
  }
}

export default {
  template,
  bindings,
  controller: ProbeComponent,
};
