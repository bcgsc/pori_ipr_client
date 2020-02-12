import template from './probe-print.pug';

const bindings = {
  pog: '<',
  report: '<',
  testInformation: '<',
  signature: '<',
  alterations: '<',
  approvedThisCancer: '<',
  approvedOtherCancer: '<',
  tcgaAcronyms: '<',
};

export default {
  template,
  bindings,
};
