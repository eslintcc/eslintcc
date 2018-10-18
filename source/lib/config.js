'use strict';

const { createEmptyConfig } = require('eslint/lib/config/config-ops');
const validator = require('eslint/lib/config/config-validator');


function __purifyConfig(config) {
  // Clear all options that affect the rules
  const empty = createEmptyConfig();
  config.globals = empty.globals;
  config.env = empty.env;
  config.rules = empty.rules;
  config.extends = empty.config;
  config.plugins = empty.plugins;
  config.overrides = empty.overrides;
  return config;
}

/**
 * To implement the hook, the rule validation function is used,
 *  because you must remove "extends" and other rules options before calling the "applyExtends" function.
 *
 * Why hook: In ESLint there is no possibility to legally loading the options of parsing the source code
 *  with the support of the hierarchy of configuration files.
 * And without options of parsing, the complexity analysis will not work.
 *
 * Reason: Using the "rules", "plugins" and "extends" options from the analyzed project
 *  will lead to the fact that there are errors when loading the dependency modules
 *  that are not installed locally for "eslintcc".
 */
function purifyESLintConfigRules() {
  const originValidate = validator.validate.bind(validator);
  validator.validate = (config, ...args) => originValidate(__purifyConfig(config), ...args);
}


exports.purifyESLintConfigRules = purifyESLintConfigRules;
