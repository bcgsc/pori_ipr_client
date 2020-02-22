import eager from './eager';

const admin = {
  ...eager.admin,
  component: 'admin',
  resolve: {
    users: ['UserService', UserService => UserService.all()],
    groups: ['GroupService', GroupService => GroupService.all()],
    projects: ['ProjectService', ProjectService => ProjectService.all({ admin: true })],
    /* eslint-disable no-shadow */
    user: ['UserService', '$state', async (UserService, $state) => {
      try {
        const resp = await UserService.me();
        return resp;
      } catch (err) {
        $state.go('public.login');
        return err;
      }
    }],
    /* eslint-disable no-shadow */
    isAdmin: ['UserService', '$state', async (UserService, $state) => {
      try {
        const resp = await UserService.isAdmin();
        if (!resp) {
          $state.go('root.reportlisting.reports');
        }
        return resp;
      } catch (err) {
        $state.go('public.login');
        return err;
      }
    }],
  },
  lazyLoad: undefined,
};

const groups = {
  ...eager.groups,
  component: 'groups',
};

const projects = {
  ...eager.projects,
  component: 'projects',
};

const users = {
  ...eager.users,
  component: 'users',
};

export default {
  admin,
  groups,
  projects,
  users,
};
