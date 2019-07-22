import template from './probe-detailed-genomic-analysis.pug';

const bindings = {
  pog: '<',
  report: '<',
  alterations: '<',
  approvedThisCancer: '<',
  approvedOtherCancer: '<',
};

class DetailedGenomicAnalysisComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, PogService, ProbeAlterationService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.PogService = PogService;
    this.ProbeAlterationService = ProbeAlterationService;
  }

  $onInit() {
    this.samples = [];
    this.alterationsGrouped = {
      therapeutic: [], prognostic: [], diagnostic: [], biological: [],
    };

    // Group Entries
    this.groupEntries(this.alterations);
    // Group Approved
    this.approvedThisCancer = this.groupAlterations(
      this.approvedThisCancer,
      [],
    );
    this.approvedOtherCancer = this.groupAlterations(
      this.approvedOtherCancer,
      [],
    );
  }


  createNewKBEntry($event) {
    const gene = {};

    this.$mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/report/genomic/knowledgebase/alterations/alterations.edit.html',
      clickOutToClose: false,
      locals: {
        pog: this.pog,
        gene,
        samples: this.samples,
        rowEvent: 'new',
        report: this.report,
      },
      controller: 'controller.dashboard.reports.genomic.detailedGenomicAnalysis.alterations.edit', // End controller
    });
  }

  /* eslint-disable class-methods-use-this */
  // Filter reference type
  refType(ref) {
    if (ref.match(/^[0-9]{8}#/)) {
      return 'pmid';
    }
    if (ref.match(/^(?:http(?:s)?:\/\/)?(?:[^.]+\.)?[A-z0-9]*\.[A-z]{2,7}/)) {
      return 'link';
    }
    return 'text';
  }


  // Prepend a link with http:// if necessary
  prependLink(link) {
    return (!link.includes('http://')) ? `http://${link}` : link;
  }
  
  // Clean up PMIDs
  cleanPMID(pmid) {
    return pmid.match(/^[0-9]{8}/)[0];
  }

  // Group approved alterations by type
  groupAlterations(collection, approvedAlterations) {
    approvedAlterations.forEach((row) => {
      if (collection.length) {
        collection.forEach((entry, index) => {
          if ((entry.gene === row.gene) && (entry.variant === row.variant)) {
            row.children = [];
            collection.push(row); // Add row to collection
          } else {
            collection[index].children.push(row);
          }
        });
      } else {
        row.children = [];
        collection.push(row);
      }
    });
    return collection;
  }
  
  // Group Entries by Type
  groupEntries(alterations) {
    // Process the entries for grouping
    alterations.forEach((row) => {
      // Add to samples if not present
      if (this.samples.includes(row.sample)) {
        this.samples.push(row.sample);
      }
      // Create new alteration type if it's not existing
      if (!(Object.prototype.hasOwnProperty.call(this.alterationsGrouped, row.alterationType))) {
        this.alterationsGrouped[row.alterationType] = [];
      }
      // Check if it exists already?
      if (this.alterationsGrouped[row.alterationType].length) {
        /* eslint-disable-next-line arrow-body-style */
        const match = this.alterationsGrouped[row.alterationType].findIndex((entry) => {
          return ((entry.gene === row.gene) && (entry.variant === row.variant));
        });
        if (match > -1) {
          // Categorical entry already exists
          this.alterationsGrouped[row.alterationType][match].children.push(row);
        } else {
          row.children = [];
          this.alterationsGrouped[row.alterationType].push(row);
        }
      } else {
        row.children = [];
        this.alterationsGrouped[row.alterationType].push(row);
      }
    });
  }
}

export default {
  template,
  bindings,
  controller: DetailedGenomicAnalysisComponent,
};
