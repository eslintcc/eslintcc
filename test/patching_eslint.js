'use strict';

const { equal, deepEqual } = require('assert').strict;
const { Test } = require('../build/@nodutilus-test');
const { CLIEngine } = require('eslint');
const { PatchedCLIEngine } = require('../source/lib/eslint-patches.js');
require('../');


class PatchingESLint extends Test {

  get name() {
    return 'Patching ESlint';
  }

  ['test: load config']() {
    const file = 'test/src/patching_eslint__load_config/index.js';
    const rules = { 'no-console': ['error'] };
    const config = new PatchedCLIEngine({ rules }).getConfigForFile(file);
    deepEqual({ ecmaVersion: 2017 }, config.parserOptions);
    deepEqual(rules, config.rules);
  }

  ['test: load config overrides']() {
    const file = 'test/src/patching_eslint__load_config/overrides.js';
    const configOrigin = new CLIEngine().getConfigForFile(file);
    const config = new PatchedCLIEngine().getConfigForFile(file);
    deepEqual(['warn'], configOrigin.rules['no-console']);
    deepEqual({ ecmaVersion: 2017 }, config.parserOptions);
    deepEqual({}, config.rules);
  }

  ['test: load config extends']() {
    const file = 'test/src/patching_eslint__load_config_extends/index.js';
    const config = new PatchedCLIEngine().getConfigForFile(file);
    deepEqual({ ecmaVersion: 2018 }, config.parserOptions);
    deepEqual({}, config.rules);
  }

  ['test: load config with option "reportUnusedDisableDirectives"']() {
    const file = 'test/src/patching_eslint__load_config_unused-directives/index.js';
    const config = new PatchedCLIEngine().getConfigForFile(file);
    equal(true, config.reportUnusedDisableDirectives);
  }

  ['test: normal and purifying config']() {
    const beforeConfig = new CLIEngine().getConfigForFile('source/complexity.js');
    const afterConfig = new PatchedCLIEngine().getConfigForFile('source/complexity.js');
    deepEqual(afterConfig.parserOptions, beforeConfig.parserOptions);
    deepEqual(afterConfig.parser, beforeConfig.parser);
    deepEqual(afterConfig.env, beforeConfig.env);
    deepEqual(afterConfig.plugins, beforeConfig.plugins);
    equal('warn', beforeConfig.rules.indent[0]);
    equal(2, beforeConfig.rules.indent[1]);
    equal(1, beforeConfig.rules.indent[2].SwitchCase);
    deepEqual({}, afterConfig.rules);
  }

  ['test: replace message data']() {
    const message = new PatchedCLIEngine({ rules: { 'complexity': ['error', 0] } })
      .executeOnFiles(['./test/src/patching_eslint__message_data.js'])
      .results[0].messages[0].message;
    equal('complexity', message.ruleId);
    equal('FunctionDeclaration', message.node.type);
    deepEqual({ complexity: 1, max: 0, name: "Function 'myFunc'" }, message.data);
  }

  ['test: executeOnFiles - no extra rules']() {
    const file = new PatchedCLIEngine()
      .executeOnFiles(['./test/src/patching_eslint__no_extra_rules.js'])
      .results[0];

    equal(0, file.messages.length);
  }

}

module.exports = PatchingESLint;
