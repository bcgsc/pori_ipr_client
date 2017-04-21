/**
 * User Settings Service
 *
 * Basic functionality for tracking, getting & setting user settings.
 *
 */
app.factory('$userSettings', ['_', '$q', 'api.user', function(_, $q, $user) {

  let userSettings = {};

  let $us =  {
    init: () => {
      userSettings = $user._me.settings;
    },

    /**
     * Retrieve a setting value
     *
     * @param {string} setting - the key for the setting value
     * @returns {*} - Returns the desired value or false if no key exists
     */
    get: (setting = undefined) => {
      if (setting === undefined) return userSettings;
      return userSettings[setting];
    },

    /**
     * Save a user setting
     *
     * @param {string} setting - Setting key
     * @param {string} value - Setting value
     *
     * @returns {Promise} - Returns the $us.update() promise;
     */
    save: (setting, value) => {
      userSettings[setting] = value;
      return $us.update();

    },

    /**
     * Updates
     *
     * @returns {Promise} - Returns updated user object
     */
    update: () => {
      let deferred = $q.defer();

      let user = $user._me;
      user.settings = userSettings; // Overwrite previous settings value
      
      $user.update(user).then(
        (result) => {
          $user._me = result;
          deferred.resolve($user._me);
        },
        (err) => {
          console.log('Failed to update user settings', err);
        }
      );

      return deferred.promise;

    }
  };

  return $us;

}]);
