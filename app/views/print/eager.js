const print = {
  name: 'print',
  url: '/print/report/:report',
  lazyLoad: async ($transition$) => {
    const mod = await import('./print.module');
    $transition$.router.stateRegistry.deregister('print');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const genomic = {
  name: 'print.genomic',
  url: '/genomic',
};

const probe = {
  name: 'print.probe',
  url: '/probe',
};

export default {
  print,
  genomic,
  probe,
};
