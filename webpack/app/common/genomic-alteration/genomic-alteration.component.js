import template from './genomic-alteration.pug';

const bindings = {
  samples: '<',
  gene: '<',
  pog: '<',
  report: '<',
};

class GenomicAlterationComponent {
  /* @ngInject */
  constructor($scope, AclService) {
    this.$scope = $scope;
    this.AclService = AclService;
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
