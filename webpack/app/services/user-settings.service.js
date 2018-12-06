/**
 * User settings factory
 * @param {*} _ {@link https://lodash.com/docs/4.17.5}
 * @param {*} $user - $user factory
 * @return {Object} $userSettings
 */
class UserSettingsService {
  constructor(_, UserService) {
    'ngInject';

    this._ = _;
    this.UserService = UserService;
    this.settingsObj = this.UserService.meObj.settings; // this may break stuff if no meObj yet
  }

  /**
   * Retrieve a setting value
   * @param {string} setting - the key for the setting value
   * @return {*} - Returns the desired value or false if no key exists
   */
  async get(setting = undefined) {
    if (!setting) {
      return this.settingsObj;
    }
    if (!this.settingsObj) {
      return {};
    }
    return this.settingsObj[setting];
  }

  /**
   * Save a user setting
   * @param {string} setting - Setting key
   * @param {string} value - Setting value
   * @return {Promise} - Returns the $us.update() promise;
   */
  async save(setting, value) {
    if (!this.settingsObj) {
      this.settingsObj = {};
    }
    this.settingsObj[setting] = value;
    return this.update();
  }

  /**
   * Updates
   *
   * @return {Promise} - Returns updated user object
   * @throws {ErrorType} - thrown when updating the user settings fails
   */
  async update() {
    const user = this.UserService.meObj;
    user.settings = this.settingsObj; // Overwrite previous settings value
    const resp = await this.UserService.update(user);
    this.UserService.meObj = resp; // this line might not be needed
    return this.UserService.meObj;
  }
}

export default UserSettingsService;
