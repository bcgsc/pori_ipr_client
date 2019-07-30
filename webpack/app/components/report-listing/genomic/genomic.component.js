import orderBy from 'lodash.orderby';
import template from './genomic.pug';

const bindings = {
  reports: '<',
  user: '<',
  projects: '<',
  isExternalMode: '<',
};

class GenomicComponent {
  /* @ngInject */
  constructor($rootScope, $scope, ReportService, $mdDialog, UserService, AclService) {
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.ReportService = ReportService;
    this.$mdDialog = $mdDialog;
    this.UserService = UserService;
    this.AclService = AclService;
  }

  async $onInit() {
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
      ready: true,
      active: true,
      presented: true,
      archived: false,
      nonproduction: false,
    };
    this.reports = this.reports.reports;

    if (this.isExternalMode) {
      this.pagination = {
        offset: 0,
        limit: 25,
        total: this.reports.total,
      };
    }

    this.selectedProject = {
      project: await this.UserService.getSetting('selectedProject') || {},
    };

    this.filter = {
      currentUser: await this.UserService.getSetting('genomicReportListCurrentUser'),
      query: null,
    };

    if (await this.UserService.getSetting('genomicReportListCurrentUser') === undefined) {
      await this.UserService.saveSetting('genomicReportListCurrentUser', true);
    }
    /* eslint-disable-next-line arrow-body-style */
    this.$scope.$watch(() => this.filter.currentUser, async (newVal, oldVal) => {
      // Ignore onload message
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
        return;
      }
      await this.UserService.saveSetting('genomicReportListCurrentUser', newVal);
    }, true);
    /* eslint-disable-next-line arrow-body-style */
    this.$scope.$watch(() => this.selectedProject, async (newVal, oldVal) => {
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
        return;
      }
      await this.UserService.saveSetting('selectedProject', newVal);
    }, true);
  }

  numReports(state) {
    return this.reports.filter(((report) => {
      return report.state === state;
    })).length;
  }

  async refreshList() {
    this.loading = true;
    const states = [];
    Object.entries(this.states).forEach(([key, value]) => {
      if (value) {
        states.push(key);
      }
    });
    const opts = {
      all: !this.filter.currentUser,
      query: this.filter.query,
      role: this.filter.role,
      states: states.join(),
      type: 'genomic',
      project: this.selectedProject.project.name,
    };
    const resp = await this.ReportService.allFiltered(opts);
    this.reports = orderBy(resp.reports, ['analysis.pog.POGID', 'createdAt'], ['asc', 'desc']);
    this.loading = false;
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
      query.split(' ').forEach((queryEntry) => {
        if (report.state !== state) {
          result = false;
          return null;
        }
        if (queryEntry.length === 0) {
          result = true;
          return null;
        }
        // Pog ID?
        if (report.analysis.pog.POGID.toLowerCase().includes(queryEntry.toLowerCase())) {
          result = true;
        }
        // Tumour Type
        if (report.patientInformation && report.patientInformation.tumourType
          && report.patientInformation.tumourType.toLowerCase().includes(queryEntry.toLowerCase())) {
          result = true;
        }
        // Tumour Type & Ploidy Model
        if (!report.tumourAnalysis) {
          return null;
        }
        if (report.tumourAnalysis && report.tumourAnalysis.ploidy
          && report.tumourAnalysis.ploidy.toLowerCase().includes(queryEntry.toLowerCase())) {
          result = true;
        }
        // Comparators
        if (report.tumourAnalysis && report.tumourAnalysis.diseaseExpressionComparator
          && report.tumourAnalysis.diseaseExpressionComparator.toLowerCase().includes(queryEntry.toLowerCase())) {
          result = true; // Disease
        }
        if (report.tumourAnalysis && report.tumourAnalysis.normalExpressionComparator
          && report.tumourAnalysis.normalExpressionComparator.toLowerCase().includes(queryEntry.toLowerCase())) {
          result = true; // Normal
        }
        // TC Search TODO: Cleanup to single line using regex. Proof of concept/do they want this?
        if (queryEntry.toLowerCase().includes('tc>')
          && report.tumourAnalysis.tumourContent > parseInt(queryEntry.split('>').pop(), 10)) {
          result = true;
        }
        if (queryEntry.toLowerCase().includes('tc<')
          && report.tumourAnalysis.tumourContent < parseInt(queryEntry.split('<').pop(), 10)) {
          result = true;
        }
        if (queryEntry.toLowerCase().includes('tc=')
          && report.tumourAnalysis.tumourContent === parseInt(queryEntry.split('=').pop(), 10)) {
          result = true;
        }
        // Search Users
        report.users.forEach((userEntry) => {
          if (userEntry.user.firstName.toLowerCase().includes(queryEntry.toLowerCase())
            || userEntry.user.lastName.toLowerCase().includes(queryEntry.toLowerCase())
            || userEntry.user.username.toLowerCase().includes(queryEntry.toLowerCase())
          ) {
            result = true;
          }
        });
      });
      return result;
    };
  }

  // Show Dialog with searching tips
  showFilterTips($event) {
    const content = `The search bar can filter the listing of POGs using a number
    of special terms.
    <ul>
    <li>Filter by tumour content: <code>tc>50 tc<40 tc=35</code></li>
    <li>Filter by POG: <code>pog544</code></li>
    <li>By ploidy: <code>diploid</code></li>
    <li>By user involved: <code>bpierce</code>, <code>Brandon</code></li>
    <li>By disease: <code>melanoma</code></li>
    <li>By comparators: <code>BRCA</code>, <code>breast</code></li>
    </ul>`;

    this.$mdDialog.show(this.$mdDialog.alert()
      .clickOutsideToClose(true)
      .title('POG Searching Tips')
      .htmlContent(content)
      .ok('Close')
      .targetEvent($event));
  }

  showGenomicDescription($event) {
    const content = `<h4>The Report</h4>
    <userEntry>The Tumour Genome Analysis report provides a comprehensive description of the somatic
    genetic alterations present in a tumour.
    All genes in the genome are assessed for alterations of all types, including substitutions,
    deletions, gene fusions, amplification, and overexpression.
    Both known and novel alterations which affect genes of potential clinical relevance are
    included in the report. Germline variants are not generally included in this report.
    </userEntry>

    <hr>
    <h4>Methods Overview</h4>
    <userEntry>The complete report is based on whole genome sequencing of tumour and matched normal DNA,
    and whole transcriptome sequencing of tumour RNA.
    Tumour and normal sequences are compared to the reference human genome to
    identify tumour-specific alterations including single nucleotide variants, small insertions
    and deletions, copy number changes, and structural variants such as translocations.
    Sequences are also assembled in a reference-independent manner to
    identify further structural alterations.
    Additionally, RNA sequences are used to measure expression of all genes,
    and genes with over and under-expression compared to reference tissues are identified.
    Somatic changes are cross-referenced to databases of therapeutic, diagnostic, prognostic,
    and biological information, pinpointing the alterations most likely to have clinical relevance.
    This comprehensive tumour description is expert reviewed by a Genome Analyst,
    highlighting potential driver mutations, providing pathway context, interpreting
    results in tumour type context, and refining potential therapeutic targets.
    </userEntry>
    <hr>

    <h4>Detailed Methods</h4>
    <userEntry>Genome status: Tumour content and ploidy are determined based on expert review of
    copy number and allelic ratios observed across all chromosomes in the tumour.
    </userEntry>

    <userEntry>Tissue comparators and expression comparisons: The most appropriate normal tissue
    and tumour tissues are chosen for expression comparisons based on
    the tumour type and observed correlation with tissue data sets.
    If no appropriate tissue comparator is available, for instance for rare tumours,
    an average across all tissues is used.
    Fold change in expression is calculated compared to the normal tissue,
    and percentile expression is calculated compared to all tumour samples of that disease type.
    Outlier expression refers to genes with very high or very low expression
    compared to what is seen in other cancers of that type.
    </userEntry>

    <userEntry>Microbial content: Sequences are compared to databases of viral,
    bacterial and fungal sequences in addition to the human genome.
    The microbial species is reported if observed levels are suggestive of
    microbial presence in the tumour sample.
    Specific viral integration sites are reported if identified in genomic DNA sequence.
    </userEntry>

    <userEntry>Mutation signature: The pattern of specific base changes and
    base context of single nucleotide variants in the tumour, referred to as the mutation signature,
    is computed and compared to patterns previously observed in a wide variety of tumour types.
    Signatures that suggest a particular mutation etiology,
    such as exposure to a specific mutagen, are noted.
    </userEntry>

    <userEntry>Mutation burden: The number of protein coding alterations of each type, including both
    known and novel events, are totaled and compared to other tumours of a similar type.
    For SNVs and indels, this includes data from TCGA, while for structural variants,
    comparisons are only made among POG samples due to differences in how these variants
    are identified in TCGA.
    </userEntry>

    <userEntry>Key genomic and transcriptomic alterations: The subset of alterations which have a
    previously described effect on genes of clinical or biological significance are summarized,
    with details of significance provided in the Detailed Genomic Analysis section,
    and details of the exact alteration provided in the section of the report corresponding
    to that mutation type.
    Additional alterations in these genes, which have not been previously observed and do not
    have an inferred functional effect, are variants of uncertain significance (VUS),
    and are only listed in the subsequent sections of the report.
    Alterations in genes which are not associated with cancer, cancer pathways, or therapeutics,
    are not usually included in the genomic report but are available upon
    request to the Genome Sciences Centre.
    </userEntry>

    <userEntry>Genomic events with potential therapeutic association: The subset of alterations with
    specific therapeutic associations are identified using the Genome Sciences Centre's expert
    curated Knowledgebase, which integrates information from sources including cancer databases,
    drug databases, clinical tests, and the literature.
    Associations are listed by the level of evidence for the use of that drug
    in the context of the observed alteration,
    including those that are approved in this or other cancer types, and those that
    have early clinical or preclinical evidence.
    </userEntry>
    <hr>
    ${this.isExternalMode ? `<h4>Field Descriptions</h4>
    <userEntry>Patient: Study identification code</userEntry>
    <userEntry>Alternate Identifier: Alternative study identifier if enrolled in 
    another genomics study (e.g. COMPARISON or PROFYLE IDs)
    <userEntry>Disease: Primary diagnosis</userEntry>
    <userEntry>Physician: Most responsible clinician for receiving the genomic report</userEntry>
    <userEntry>Age: Status at enrollment</userEntry>
    <userEntry>Status: Status of the report</userEntry>
    <hr>` : ''}
    <userEntry>The Tumour Genome Analysis report is developed by Canada's Michael Smith Genome
    Sciences Centre, part of the BC Cancer Agency.
    Contents should be regarded as purely investigational
    and are intended for research purposes only.
    </userEntry>`;
    
    this.$mdDialog.show(this.$mdDialog.alert()
      .clickOutsideToClose(true)
      .title('About Genomic Reports')
      .htmlContent(content)
      .ok('Close')
      .targetEvent($event));
  }
}

export default {
  template,
  bindings,
  controller: GenomicComponent,
};
