const probe = {
  name: 'root.reportlisting.pog.probe',
  url: '/probe',
  lazyLoad: async ($transition$) => {
    const mod = await import('./probe-report.module');
    $transition$.router.stateRegistry.deregister('root.reportlisting.pog.probe');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const summary = {
  name: 'root.reportlisting.pog.probe.summary',
  url: '/summary',
};

const detailedGenomicAnalysis = {
  name: 'root.reportlisting.pog.probe.detailedGenomicAnalysis',
  url: '/detailedGenomicAnalysis',
};

const appendices = {
  name: 'root.reportlisting.pog.probe.appendices',
  url: '/appendices',
};

const settings = {
  name: 'root.reportlisting.pog.probe.reportSettings',
  url: '/reportSettings',
};

export default {
  probe,
  summary,
  detailedGenomicAnalysis,
  appendices,
  settings,
};
