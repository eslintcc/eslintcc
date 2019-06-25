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

  ['test: purify config']() {
    const cmd = 'node ./test/src/patching_eslint__config';
    const beforeConfig = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    const afterConfig = new PatchedCLIEngine().getConfigForFile('source/complexity.js');
    deepEqual(afterConfig.env, beforeConfig.env);
    deepEqual(afterConfig.parserOptions, beforeConfig.parserOptions);
    deepEqual(afterConfig.parser, beforeConfig.parser);
    equal('eslint:recommended', beforeConfig.extends);
    equal('eslint:recommended', afterConfig.extends);
    equal(undefined, beforeConfig.plugins);
    equal(undefined, afterConfig.plugins);
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
