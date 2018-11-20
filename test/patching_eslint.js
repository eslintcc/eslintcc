'use strict';

const { equal, deepEqual } = require('assert').strict;

const { Test } = require('@ndk/test');

const { PatchedCLIEngine } = require('../source/lib/eslint-patches.js');


class PatchingESLint extends Test {

  get name() {
    return 'Loading configuration';
  }

  ['test: loading configuration']() {
    const beforeConfig = new PatchedCLIEngine().getConfigForFile('.');
    require('../');
    const afterConfig = new PatchedCLIEngine().getConfigForFile('.');
    deepEqual(afterConfig.env, beforeConfig.env);
    deepEqual(afterConfig.parserOptions, beforeConfig.parserOptions);
    deepEqual(afterConfig.parser, beforeConfig.parser);
    equal('eslint:recommended', beforeConfig.extends);
    equal(undefined, afterConfig.extends);
    equal(undefined, beforeConfig.plugins);
    equal(undefined, afterConfig.plugins);
    deepEqual(['warn', 2, { 'SwitchCase': 1 }], beforeConfig.rules.indent);
    deepEqual({}, afterConfig.rules);
  }

  ['test: replace message data']() {
    const message = new PatchedCLIEngine({ rules: { 'complexity': ['error', 0] } })
      .executeOnFiles(['./test/src/patching_eslint__message_data.js'])
      .results[0].messages[0].message;
    equal('complexity', message.ruleId);
    equal('FunctionDeclaration', message.node.type);
    deepEqual({ complexity: 1, name: "Function 'myFunc'" }, message.data);
  }

}

module.exports = PatchingESLint;
PatchingESLint.runIsMainModule();
