import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import AdminComponent from './admin.component';
import UsersModule from './users/users.module';
import ProjectModule from './projects/projects.module';
import GroupsModule from './groups/groups.module';

angular.module('admin', [
  uiRouter,
  UsersModule,
  ProjectModule,
  GroupsModule,
]);

export default angular.module('admin')
  .component('admin', AdminComponent)
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.admin', {
        url: '/admin',
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
      });
  })
  .name;
