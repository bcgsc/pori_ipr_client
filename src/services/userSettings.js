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
     * @return {Promise} - Returns updated user object
     * @throws {ErrorType} - thrown when updating the user settings fails
     */
    update: async () => {
      const user = await $user.me();
      user.settings = userSettings; // Overwrite previous settings value
      return $user.update(user);
    },
  };

  return $us;
}

$userSettings.$inject = ['_', 'api.user'];

angular
  .module('bcgscIPR')
  .factory('$userSettings', $userSettings);
