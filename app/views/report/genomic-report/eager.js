const genomic = {
  name: 'root.reportlisting.pog.genomic',
  url: '/genomic',
  lazyLoad: async ($transition$) => {
    const mod = await import('./genomic-report.module');
    $transition$.router.stateRegistry.deregister('root.reportlisting.pog.genomic');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const summary = {
  name: 'root.reportlisting.pog.genomic.summary',
  url: '/summary',
};

const analystComments = {
  name: 'root.reportlisting.pog.genomic.analystComments',
  url: '/analystComments',
};

const pathwayAnalysis = {
  name: 'root.reportlisting.pog.genomic.pathwayAnalysis',
  url: '/pathwayAnalysis',
};

const therapeutic = {
  name: 'root.reportlisting.pog.genomic.therapeutic',
  url: '/therapeutic',
};

const slides = {
  name: 'root.reportlisting.pog.genomic.slide',
  url: '/slide',
};

const discussion = {
  name: 'root.reportlisting.pog.genomic.discussion',
  url: '/discussion',
};

const kbMatches = {
  name: 'root.reportlisting.pog.genomic.kbmatches',
  url: '/kbmatches',
};

const microbial = {
  name: 'root.reportlisting.pog.genomic.microbial',
  url: '/microbial',
};

const spearman = {
  name: 'root.reportlisting.pog.genomic.spearman',
  url: '/spearman',
};

const diseaseSpecific = {
  name: 'root.reportlisting.pog.genomic.diseaseSpecificAnalysis',
  url: '/diseaseSpecificAnalysis',
};

const smallMutations = {
  name: 'root.reportlisting.pog.genomic.smallMutations',
  url: '/smallMutations',
};

const copyNumber = {
  name: 'root.reportlisting.pog.genomic.copyNumberAnalyses',
  url: '/copyNumberAnalyses',
};

const structuralVariants = {
  name: 'root.reportlisting.pog.genomic.structuralVariation',
  url: '/structuralVariation',
};

const expression = {
  name: 'root.reportlisting.pog.genomic.expressionAnalysis',
  url: '/expressionAnalysis',
};

const appendices = {
  name: 'root.reportlisting.pog.genomic.appendices',
  url: '/appendices',
};

const settings = {
  name: 'root.reportlisting.pog.genomic.reportSettings',
  url: '/reportSettings',
};

export default {
  genomic,
  summary,
  analystComments,
  pathwayAnalysis,
  therapeutic,
  slides,
  discussion,
  kbMatches,
  microbial,
  spearman,
  diseaseSpecific,
  smallMutations,
  copyNumber,
  structuralVariants,
  expression,
  appendices,
  settings,
};
