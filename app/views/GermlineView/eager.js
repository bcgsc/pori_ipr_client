const germline = {
  name: 'root.germline',
  url: '/germline',
  lazyLoad: async ($transition$) => {
    const mod = await import(/* webpackChunkName: "germline" */ './germline.module');
    $transition$.router.stateRegistry.deregister('root.germline');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const board = {
  name: 'root.germline.board',
  url: '/board',
};

const report = {
  name: 'root.germline.report',
  url: '/report/patient/:patient/biopsy/:biopsy/report/:report',
};

export default {
  germline,
  board,
  report,
};
