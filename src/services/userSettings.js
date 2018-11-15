/**
 * User settings factory
 * @param {*} _ {@link https://lodash.com/docs/4.17.5}
 * @param {*} $user - $user factory
 * @return {Object} $userSettings
 */
function $userSettings(_, $user) {
  let userSettings = {};

  const $us = {
    init: () => {
      userSettings = $user.meObj.settings;
    },

    /**
     * Retrieve a setting value
     *
     * @param {string} setting - the key for the setting value
     * @returns {*} - Returns the desired value or false if no key exists
     */
    get: (setting = undefined) => {
      if (setting === undefined) return userSettings;
      
      if (userSettings === undefined) return {};
      
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
      if (userSettings === undefined) userSettings = {};
      userSettings[setting] = value;
      return $us.update();
    },

    /**
     * Updates
     *
     * @returns {Promise} - Returns updated user object
     */
    update: async () => {
      const user = $user.meObj;
      user.settings = userSettings; // Overwrite previous settings value
      try {
        const resp = await $user.update(user);
        $user.meObj = resp;
        return $user.meObj;
      } catch (err) {
        console.log('Failed to update user settings', err);
        return Promise.reject(err);
      }
    },
  };

  return $us;
}

$userSettings.$inject = ['_', 'api.user'];

angular
  .module('bcgscIPR')
  .factory('$userSettings', $userSettings);
