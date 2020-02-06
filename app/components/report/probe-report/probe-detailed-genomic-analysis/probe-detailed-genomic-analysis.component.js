import template from './probe-detailed-genomic-analysis.pug';
import './probe-detailed-genomic-analysis.scss';

const bindings = {
  pog: '<',
  report: '<',
  reportEdit: '<',
  alterations: '<',
  approvedThisCancer: '<',
  approvedOtherCancer: '<',
  print: '<',
};

class DetailedGenomicAnalysisComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, PogService) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.PogService = PogService;
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
