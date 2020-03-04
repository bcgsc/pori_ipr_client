import template from './genomic-print.pug';

const bindings = {
  report: '<',
  genomicAlterations: '<',
  variantCounts: '<',
  mutationSummary: '<',
  probeTarget: '<',
  mutationSignature: '<',
  microbial: '<',
  therapeutic: '<',
  analystComments: '<',
  pathway: '<',
  smallMutationImages: '<',
  mutationSummaryImages: '<',
  smallMutations: '<',
  copyNumberAnalysesImages: '<',
  cnvs: '<',
  structuralVariantsImages: '<',
  structuralVariants: '<',
  mavisSummary: '<',
  outliers: '<',
  drugTargets: '<',
  densityGraphs: '<',
  tcgaAcronyms: '<',
  slides: '<',
  therapeuticRowData: '<',
};

export default {
  template,
  bindings,
};
