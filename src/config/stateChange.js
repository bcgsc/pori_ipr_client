/**
 * State change handler which applies logic to transition start and errors
 * @param {*} $rootScope {@link https://docs.angularjs.org/api/ng/service/$rootScope}
 * @param {*} $state {@link https://github.com/angular-ui/ui-router/wiki/quick-reference}
 * @param {*} $acl - $acl service
 * @param {*} $user - $user service
 * @param {*} $userSettings - $userSettings service
 * @param {*} _ {@link https://lodash.com/docs/4.17.5}
 * @param {*} $mdToast {@link https://material.angularjs.org/latest/api/service/$mdToast}
 * @param {*} $localStorage {@link https://github.com/gsklee/ngStorage}
 * @param {*} $interval {@link https://docs.angularjs.org/api/ng/service/$interval}
 * @param {*} keycloakAuth - keycloakAuth factory
 * @param {*} $mdDialog {@link https://material.angularjs.org/latest/api/service/$mdDialog}
 * @param {*} $transitions {@link https://ui-router.github.io/ng1/docs/1.0.0-beta.1/classes/transition.transitionservice.html}
 * @returns {*} stateChange
 */
function stateChange($rootScope, $state, $acl, $user, $userSettings, _, $mdToast, $localStorage,
  $interval, keycloakAuth, $mdDialog, $transitions) {
  $interval((async () => {
    const seconds = $localStorage.expiry - (Date.now() / 1000);
    const minutes = Math.floor(seconds / 60);
    if (seconds <= 900) {
      try {
        const resp = await $mdDialog.show($mdDialog.confirm()
          .title('Attention, ')
          .textContent(`Session expiring in ${minutes} minutes.
  Please click on the button below to re-login.`)
          .cancel('I will do it soon!')
          .ok('Re-log now!'));
        if (resp) {
          keycloakAuth.logout();
        }
      } catch (err) { angular.noop(); }
    }
  }), 300000);
  // On State Change, Show Spinner!
  $transitions.onStart({ }, async (transition) => {
    console.log('changing state...', transition.to());
    $rootScope.showLoader = true;
    $rootScope.PROJECT = CONFIG.PROJECT;
    $rootScope.CONFIG = CONFIG;

    $rootScope.SES_permissionResource = $acl.resource;
    $rootScope.SES_permissionAction = $acl.action;

    // Check for transitions among child states to run auth check
    // Transitions among top level states are checked by the router but not for child -> child
    if (transition.from().name.match(/.*(?=\.)/g) === transition.to().name.match(/.*(?=\.)/g)) {
      try {
        await $user.me();
        await $userSettings.init();
      } catch (err) {
        Promise.reject(err);
        $state.go('public.login');
      }
    }
    transition.promise.finally(() => {
      $rootScope.showLoader = false;
    });
  });

  $transitions.onError({ }, (transition) => {
    try { // This try catch can be removed once all rejections return new Error('');
      switch (transition.error().message) {
        case 'externalModeError':
          $state.go('dashboard.reports.genomic'); // transition to genomic report state
          break;
        case 'projectAccessError':
          $mdToast.showSimple('You do not have access to cases in this project');
          $state.go('dashboard.home');
          break;
        default:
          console.log('State Change Error:', transition.error());
          $localStorage.returnToState = transition.to().name;
          $localStorage.returnToStateParams = JSON.stringify(transition.params());
          $state.go('public.login');
      }
    } catch (err) {
      console.log('State Change Error:', transition.error());
      $localStorage.returnToState = transition.to().name;
      $localStorage.returnToStateParams = JSON.stringify(transition.params());
      $state.go('public.login');
    }
  });
}

stateChange.$inject = ['$rootScope', '$state', '$acl', 'api.user', '$userSettings', '_', '$mdToast',
  '$localStorage', '$interval', 'keycloakAuth', '$mdDialog', '$transitions'];

angular
  .module('bcgscIPR')
  .run(stateChange);

app.config(($mdDateLocaleProvider) => {
  $mdDateLocaleProvider.formatDate = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : '';
  };
});
