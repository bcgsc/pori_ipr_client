const terms = {
  name: 'root.terms',
  url: '/terms',
  lazyLoad: async ($transition$) => {
    const mod = await import(/* webpackChunkName: "terms" */ './terms.module');
    $transition$.router.stateRegistry.deregister('root.terms');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

export default {
  terms,
};
