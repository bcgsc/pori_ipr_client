const fs = require('fs'),
      minimist = require('minimist');

/**
 * Manage Build Environment
 *
 */

let config = {
  argvs: {
    string: 'env'
  }
};

let configManager = {

  // Environment setting
  _env: null,
  _config: {},

  /**
   * Detect the current environment and return
   *
   * @param {string} [override] - Force environment state
   * @returns {string|null} - Returns the detected (or forced) environment state
   */
  detectEnvironment: (override=null) => {

    let args = {env: null};

    // Override?
    if(override !== null && override !== undefined) return configManager.setEnvironment(override);

    if(process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== null) {
      // Check if it's an allowed environment setting
      if(['production', 'development', 'testing', 'staging', 'local'].indexOf(process.env.NODE_ENV) === -1) throw new Error('Invalid environment setting');

      // Set env from process.env
      return configManager.setEnvironment(process.env.NODE_ENV);
    }

    // Check command line args
    if(process.argv[1] && process.argv[1].indexOf('-') > -1) args = minimist(process.argv.slice(1), config.argvs);
    if(process.argv[1] && process.argv[1].indexOf('-') === -1) args = minimist(process.argv.slice(2), config.argvs);

    if(args.env) return configManager.setEnvironment(args.env);

    return configManager.setEnvironment('production'); // Finally, default to production


  },

  /**
   * Retrieve configuration settings for the specified environment
   *
   * @param override
   * @return {object} configuration settings
   */
  loadConfig: (override) => {
    // Grab the config
    const confs = require('../env.json');

    // Try to extract the config subset for this env
    let confSubset = confs[(override || configManager.getEnvironment())];

    // Pull out config from this section
    if(confSubset === undefined) throw new Error('Unable to retrieve configuration for the environment: '+(override || configManager.getEnvironment()));

    return configManager._config = confSubset;
  },

  /**
   * Get & return configuration settings
   *
   * @returns {configManager._config|{}}
   */
  getConfig: () => {
    if(configManager._config == {}) {
      console.error('No config set');
      process.exit();
    }
    return configManager._config;
  },

  /**
   * Write Config
   *
   */
  writeConfig: () => {
    // Fill requireds if empty
    if(configManager._env == null) configManager.detectEnvironment();
    if(configManager._config == {}) configManager.loadConfig();

    // Create Write Stream for env.js file
    let wStream = fs.createWriteStream('./builds/'+configManager.getEnvironment()+'/assets/env.js');
    wStream.write('CONFIG = ');
    wStream.write(JSON.stringify(configManager.getConfig()));
    wStream.end();
  },

  /**
   * Set Environment State
   *
   * @param {string} env
   * @returns {string}
   */
  setEnvironment: (env) => {
    return configManager._env = env;
  },

  /**
   * Get Environment State
   *
   * @returns {string}
   */
  getEnvironment: () => {
    return configManager._env;
  }

};

module.exports = configManager;