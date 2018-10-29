const $async = ['$rootScope', '$log', ($rootScope, $log) => {
  return (callback) => {
    const validArgument = (typeof callback === 'function');

    const wrapper = async function wrapper(...args) {
      try {
        const resp = await callback.call(this, ...args);
        $rootScope.$digest();
        return resp;
      } catch (err) {
        $rootScope.$digest();
        return Promise.reject(new Error(err.message));
      }
    };

    if (!validArgument) {
      $log.error(`$async expects a function argument, got ${typeof callback}`);
    }

    return validArgument ? wrapper : () => { /* noop */ };
  };
}];

angular
  .module('angular-async-await', [])
  .factory('$async', $async);
