'use strict';

const { equal, deepEqual } = require('assert').strict;
const { execSync } = require('child_process');

const { Test } = require('@ndk/test');

const { PatchedCLIEngine } = require('../source/lib/eslint-patches.js');
require('../');


class PatchingESLint extends Test {

  get name() {
    return 'Patching ESlint';
  }

  ['test: load config']() {
    const file = 'test/src/patching_eslint__load_config/index.js';
    const config = new PatchedCLIEngine().getConfigForFile(file);
    equal(undefined, config.extends);
    equal(undefined, config.processor);
    deepEqual({}, config.env);
    deepEqual({}, config.globals);
    deepEqual([], config.plugins);
    deepEqual({}, config.rules);
  }

  ['test: load config overrides']() {
    const file = 'test/src/patching_eslint__load_config/overrides.js';
    const config = new PatchedCLIEngine().getConfigForFile(file);
    equal(undefined, config.extends);
    equal(undefined, config.processor);
    deepEqual({}, config.env);
    deepEqual({}, config.globals);
    deepEqual([], config.plugins);
    deepEqual({}, config.rules);
  }

  ['test: purify config']() {
    const cmd = 'node ./test/src/patching_eslint__config';
    const beforeConfig = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    const afterConfig = new PatchedCLIEngine().getConfigForFile('source/complexity.js');
    deepEqual(afterConfig.parserOptions, beforeConfig.parserOptions);
    deepEqual(afterConfig.parser, beforeConfig.parser);
    deepEqual({ es6: true, node: true }, beforeConfig.env);
    deepEqual({}, afterConfig.env);
    deepEqual([], beforeConfig.plugins);
    deepEqual([], afterConfig.plugins);
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

}

module.exports = PatchingESLint;
PatchingESLint.runIsMainModule();
