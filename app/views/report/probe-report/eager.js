const probe = {
  name: 'root.reportlisting.probe',
  url: '/report/:analysis_report/probe',
  lazyLoad: async ($transition$) => {
    const mod = await import(/* webpackChunkName: "probe-report" */ './probe-report.module');
    $transition$.router.stateRegistry.deregister('root.reportlisting.probe');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const summary = {
  name: 'root.reportlisting.probe.summary',
  url: '/summary',
};

const detailedGenomicAnalysis = {
  name: 'root.reportlisting.probe.detailedGenomicAnalysis',
  url: '/detailedGenomicAnalysis',
};

const appendices = {
  name: 'root.reportlisting.probe.appendices',
  url: '/appendices',
};

const settings = {
  name: 'root.reportlisting.probe.reportSettings',
  url: '/reportSettings',
};

export default {
  probe,
  summary,
  detailedGenomicAnalysis,
  appendices,
  settings,
};
