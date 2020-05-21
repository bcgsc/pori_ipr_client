import template from './genomic-alteration.pug';
import './genomic-alteration.scss';

const bindings = {
  samples: '<',
  gene: '<',
  report: '<',
  print: '<',
};

class GenomicAlterationComponent {
  /* @ngInject */
  constructor($scope) {
    this.$scope = $scope;
  }

  $onInit() {
    this.gene.showChildren = false;
  }

  getObservedVariant() {
    const { variant, variantType } = this.gene;

    if (variantType === 'cnv') {
      return `${variant.gene.name} ${variant.cnvState}`;
    }
    if (variantType === 'sv') {
      return `(${
        variant.gene1.name || '?'
      },${
        variant.gene2.name || '?'
      }):fusion(e.${
        variant.exon1 || '?'
      },e.${
        variant.exon2 || '?'
      })`;
    }
    if (variantType === 'mut') {
      return `${variant.gene.name}:${variant.proteinChange}`;
    }
    return `${variant.gene.name} ${variant.expressionState}`;
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

  /* eslint-disable class-methods-use-this */
  // Prepend a link with http:// if necessary
  prependLink(link) {
    return (!link.includes('http://')) ? `http://${link}` : link;
  }

  /* eslint-disable class-methods-use-this */
  // Clean up PMIDs
  cleanPMID(pmid) {
    return pmid.match(/^[0-9]{8}/)[0];
  }
}

export default {
  template,
  bindings,
  controller: GenomicAlterationComponent,
};
