import templateUrl from './dashboard.pug';

const DashboardComponent = {
  templateUrl: templateUrl,
  controller: class DashboardComponent {
    constructor(_, $rootScope, $scope, $state, $pog, $image, $userSettings, user, isAdmin, $acl,
      toastService) {
      'ngInject';

      this._ = _;
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.$state = $state;
      this.$pog = $pog;
      this.$image = $image;
      this.$userSettings = $userSettings;
      this.user = user;
      this.isAdmin = isAdmin;
      this.$acl = $acl;
      this.toastService = toastService;
    }
    
    $onInit() {
      this.check = {
        resource: this.$acl.resource,
        action: this.$acl.action,
      };
      this.maximized = this.$userSettings.get('sideBarState');
      this.$rootScope.$on('sidebarToggle', () => {
        this.$userSettings.save('sideBarState', !this.maximized);
        this.maximized = !this.maximized;
      });
    }
  },
};

export default DashboardComponent;
