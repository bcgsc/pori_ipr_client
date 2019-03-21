import sortBy from 'lodash.sortby';
import template from './mutation-signature.pug';
import './mutation-signature.scss';

const bindings = {
  pog: '<',
  report: '<',
  mutationSummary: '<',
  mutationSignature: '<',
  mode: '<',
};

class MutationSignatureComponent {
  /* @ngInject */
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.nnlsNormal = false;
    this.mutationSort = { col: 'signature', order: true };
    this.selectedSigs = [];
    this.modifier = {};
  }

  $onInit() {
    this.mode = this.mode || 'normal';
    // If mode is pick, preload selected sigs:
    if (this.mode === 'pick') {
      this.mutationSummary.mutationSignature.forEach((v) => {
        this.selectedSigs.push(v.ident);
        this.modifier[v.ident] = v.modifier;
      });
    }
    this.processSignature(angular.copy(this.mutationSignature));
  }
      

  // For pick mode, adds to selected Sigs
  addToSelection(signature) {
    // Remove from Selected Signatures
    if (this.selectedSigs.includes(signature.ident)) {
      this.selectedSigs = this.selectedSigs.filter((sig) => {
        return sig !== signature.ident;
      });
    } else {
      this.selectedSigs.push(signature.ident);
    }
    this.updateSelectedSigs();
  }

  // Rebuild Selected Signatures
  updateSelectedSigs() {
    this.mutationSummary.mutationSignature = [];
    // Rebuild!
    this.selectedSigs.forEach((s) => {
      const seek = this.mutationSignature.find((sig) => {
        return sig.ident === s;
      });
      // Found a seek
      if (seek) {
        // Check for modifier
        if (this.modifier[seek.ident]) seek.modifier = this.modifier[seek.ident];
        this.mutationSummary.mutationSignature.push(seek);
      }
    });
  }

  sortMutations(col) {
    // Is this a valid column?
    if (!['signature', 'nnls', 'pearson'].includes(col)) {
      return false;
    }

    if (this.mutationSort.col === col) {
      this.mutationSort.order = !this.mutationSort.order;
    } else {
      this.mutationSort.col = col;
      this.mutationSort.order = true;
    }
    this.processSignature(angular.copy(this.mutationSignature));
  }

  // Check if the current mutation is a selected one.
  isSelectedMutation(ident) {
    const found = this.mutationSummary.mutationSignature.find((m) => {
      return m.ident === ident;
    });
    return found !== undefined;
  }

  toggleNnlsNormalize() {
    this.nnlsNormal = !this.nnlsNormal;
    this.processSignature(angular.copy(this.mutationSignature));
  }

  processSignature(sigs) {
    this.mutationSignature = [];
    let nnlsMax = (this.nnlsNormal) ? 0 : 1;

    sigs.forEach((r) => {
      if (r.nnls > nnlsMax) nnlsMax = r.nnls;
    });

    sigs.forEach((r) => {
      // Round to 3 sigfigs
      r.pearson = parseFloat((r.pearson).toFixed(3));
      r.nnls = parseFloat((r.nnls).toFixed(3));

      // Produced rounded numbers
      r.pearsonColour = Math.round((((r.pearson < 0) ? 0 : r.pearson) * 100) / 5) * 5;
      r.nnlsColour = Math.round(((r.nnls / nnlsMax) * 100) / 5) * 5;

      this.mutationSignature.push(r);
    });
    this.mutationSignature = sortBy(this.mutationSignature, this.mutationSort.col);
    if (!this.mutationSort.order) {
      this.mutationSignature.reverse();
    }
  }
}

export default {
  template,
  bindings,
  controller: MutationSignatureComponent,
};
