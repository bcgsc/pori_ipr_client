const print = {
  name: 'print',
  url: '/print/report/:report',
};

const genomic = {
  name: 'print.genomic',
  url: '/genomic',
  lazyLoad: async ($transition$) => {
    const mod = await import(/* webpackChunkName: "print" */ './print.module');
    $transition$.router.stateRegistry.deregister('print');
    return $transition$.injector().native.loadNewModules([mod.genomicPrint]);
  },
};

const probe = {
  name: 'print.probe',
  url: '/probe',
  lazyLoad: async ($transition$) => {
    const mod = await import(/* webpackChunkName: "print" */ './print.module');
    $transition$.router.stateRegistry.deregister('print');
    return $transition$.injector().native.loadNewModules([mod.probePrint]);
  },
};

export default {
  print,
  genomic,
  probe,
};
