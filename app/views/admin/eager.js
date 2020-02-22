const admin = {
  name: 'root.admin',
  url: '/admin',
  lazyLoad: async ($transition$) => {
    const mod = await import('./admin.module');
    $transition$.router.stateRegistry.deregister('root.admin');
    return $transition$.injector().native.loadNewModules([mod.default]);
  },
};

const groups = {
  name: 'root.admin.groups',
  url: '/groups',
};

const projects = {
  name: 'root.admin.projects',
  url: '/projects',
};

const users = {
  name: 'root.admin.users',
  url: '/users',
};

export default {
  admin,
  groups,
  projects,
  users,
};
