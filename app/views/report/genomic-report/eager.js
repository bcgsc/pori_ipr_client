const genomic = {
  name: 'root.reportlisting.genomic',
  url: '/report/:analysis_report/genomic',
  lazyLoad: async ($transition$) => {
    const mod = await import(/* webpackChunkName: "genomic-report" */ './genomic-report.module');
    $transition$.router.stateRegistry.deregister('root.reportlisting.genomic');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const summary = {
  name: 'root.reportlisting.genomic.summary',
  url: '/summary',
};

const analystComments = {
  name: 'root.reportlisting.genomic.analystComments',
  url: '/analystComments',
  lazyLoad: async ($transition$) => {
    const mod = await import(/* webpackChunkName: "quill" */ 'ng-quill');
    await import(/* webpackChunkName: "quill" */ 'quill/dist/quill.snow.css');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const pathwayAnalysis = {
  name: 'root.reportlisting.genomic.pathwayAnalysis',
  url: '/pathwayAnalysis',
};

const therapeutic = {
  name: 'root.reportlisting.genomic.therapeutic',
  url: '/therapeutic',
};

const slides = {
  name: 'root.reportlisting.genomic.slide',
  url: '/slide',
};

const discussion = {
  name: 'root.reportlisting.genomic.discussion',
  url: '/discussion',
};

const kbMatches = {
  name: 'root.reportlisting.genomic.kbmatches',
  url: '/kbmatches',
};

const microbial = {
  name: 'root.reportlisting.genomic.microbial',
  url: '/microbial',
};

const spearman = {
  name: 'root.reportlisting.genomic.spearman',
  url: '/spearman',
};

const diseaseSpecific = {
  name: 'root.reportlisting.genomic.diseaseSpecificAnalysis',
  url: '/diseaseSpecificAnalysis',
};

const smallMutations = {
  name: 'root.reportlisting.genomic.smallMutations',
  url: '/smallMutations',
};

const copyNumber = {
  name: 'root.reportlisting.genomic.copyNumberAnalyses',
  url: '/copyNumberAnalyses',
};

const structuralVariants = {
  name: 'root.reportlisting.genomic.structuralVariation',
  url: '/structuralVariation',
};

const expression = {
  name: 'root.reportlisting.genomic.expressionAnalysis',
  url: '/expressionAnalysis',
};

const appendices = {
  name: 'root.reportlisting.genomic.appendices',
  url: '/appendices',
};

const settings = {
  name: 'root.reportlisting.genomic.reportSettings',
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
