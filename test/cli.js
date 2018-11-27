'use strict';

const { equal, deepEqual } = require('assert').strict;
const { execSync } = require('child_process');
const { sep, resolve } = require('path');

const { Test } = require('@ndk/test');


class TestCLI extends Test {

  get name() {
    return 'cli';
  }

  ['test: help']() {
    const helpMod = require('../source/lib/help');
    const helpStr = execSync('node source/cli.js', { encoding: 'utf-8' });
    equal(helpMod.trim(), helpStr.trim());
  }

  ['test: greaterThan + lessThan + showRules']() {
    const cmd = 'node source/cli.js test/src/complexity__messages_gtlt.js --gt A --lt F --sr';
    const report = execSync(cmd, { encoding: 'utf-8' });
    equal(`test${sep}src${sep}complexity__messages_gtlt.js\n` +
      '  \x1b[32;1mB\x1b[0m  9:0 function myFunc2 (max-params = 2)\n' +
      '  \x1b[33;1mC\x1b[0m 15:0 function myFunc3 (max-params = 3)', report.trim());
  }

  ['test: greaterThan + lessThan + json']() {
    const cmd = 'node source/cli.js test/src/complexity__messages_gtlt.js --gt B --lt F --format json';
    const report = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    deepEqual({
      'files': [{
        'fileName': resolve('test/src/complexity__messages_gtlt.js'),
        'messages': [{
          'id': 'function/15:0/17:1',
          'view': 'function',
          'loc': { 'start': { 'line': 15, 'column': 0 }, 'end': { 'line': 17, 'column': 1 } },
          'namePath': 'function myFunc3',
          'complexityRules': { 'max-params': 3, 'complexity': 1 },
          'complexityRanks': {
            'max-params-value': 3,
            'max-params-label': 'C',
            'complexity-value': 0.2,
            'complexity-label': 'A'
          },
          'maxValue': 3,
          'maxLabel': 'C'
        }]
      }]
    }, report);
  }

}


module.exports = TestCLI;
TestCLI.runIsMainModule();
