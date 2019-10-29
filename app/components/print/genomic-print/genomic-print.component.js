import template from './genomic-print.pug';

const bindings = {
  pog: '<',
  report: '<',
  genomicAlterations: '<',
  variantCounts: '<',
  genomicEvents: '<',
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
  therapeuticColumnDefs: '<',
};

export default {
  template,
  bindings,
};
