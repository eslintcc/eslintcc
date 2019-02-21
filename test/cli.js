'use strict';

const { equal, deepEqual, throws } = require('assert').strict;
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
    const cmd = 'node source/cli.js test/src/complexity__messages_gtlt.js --gt A --lt F --sr -mr=f -mar=f';
    const report = execSync(cmd, { encoding: 'utf-8' });
    equal(`\x1b[33;1mD\x1b[0m test${sep}src${sep}complexity__messages_gtlt.js\n` +
      '  \x1b[32;1mB\x1b[0m  9:0 function myFunc2 (max-params = 2)\n' +
      '  \x1b[33;1mC\x1b[0m 15:0 function myFunc3 (max-params = 3)', report.trim());
  }

  ['test: greaterThan + lessThan + json']() {
    const cmd = 'node source/cli.js test/src/complexity__messages_gtlt.js --gt B --lt F --format json';
    const report = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    deepEqual({
      'averageRank': 'D',
      'averageRankValue': 3.406,
      'errors': {
        'maxAverageRank': true,
        'maxRank': 2
      },
      'ranksCount': {
        'A': 1,
        'B': 1,
        'C': 1,
        'D': 0,
        'E': 0,
        'F': 2
      },
      'files': [{
        'averageRank': 'D',
        'averageRankValue': 3.406,
        'fileName': resolve('test/src/complexity__messages_gtlt.js'),
        'messages': [{
          'id': '15:0:17:1',
          'type': 'function',
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

  ['test: json + rules']() {
    const cmd = 'node source/cli.js test/src/complexity__one_rule.js --format json';
    const report1 = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    deepEqual({
      'averageRank': 'F',
      'averageRankValue': 5.166,
      'errors': {
        'maxAverageRank': true,
        'maxRank': 1
      },
      'ranksCount': {
        'A': 0,
        'B': 0,
        'C': 0,
        'D': 0,
        'E': 0,
        'F': 1
      },
      'files': [{
        'averageRank': 'F',
        'averageRankValue': 5.166,
        'fileName': resolve('test/src/complexity__one_rule.js'),
        'messages': [{
          'id': '3:0:5:1',
          'type': 'function',
          'loc': { 'start': { 'line': 3, 'column': 0 }, 'end': { 'line': 5, 'column': 1 } },
          'namePath': 'function myFunc',
          'complexityRules': {
            'max-params': 7,
            'complexity': 1
          },
          'complexityRanks': {
            'max-params-value': 5.166,
            'max-params-label': 'F',
            'complexity-value': 0.2,
            'complexity-label': 'A'
          },
          'maxValue': 5.166,
          'maxLabel': 'F'
        }]
      }]
    }, report1);
    const report2 = JSON.parse(execSync(cmd + ' --rules complexity', { encoding: 'utf-8' }));
    deepEqual({
      'averageRank': 'A',
      'averageRankValue': 0.2,
      'errors': {
        'maxAverageRank': false,
        'maxRank': 0
      },
      'ranksCount': {
        'A': 1,
        'B': 0,
        'C': 0,
        'D': 0,
        'E': 0,
        'F': 0
      },
      'files': [{
        'averageRank': 'A',
        'averageRankValue': 0.2,
        'fileName': resolve('test/src/complexity__one_rule.js'),
        'messages': [{
          'id': '3:0:5:1',
          'type': 'function',
          'loc': { 'start': { 'line': 3, 'column': 0 }, 'end': { 'line': 5, 'column': 1 } },
          'namePath': 'function myFunc',
          'complexityRules': {
            'complexity': 1
          },
          'complexityRanks': {
            'complexity-value': 0.2,
            'complexity-label': 'A'
          },
          'maxValue': 0.2,
          'maxLabel': 'A'
        }]
      }]
    }, report2);
  }

  ['test: json + 2-rules']() {
    const cmd = 'node source/cli.js test/src/complexity__one_rule.js --format json';
    const cmd2 = cmd + ' --rules logic --rules max-statements';
    const report1 = JSON.parse(execSync(cmd, { encoding: 'utf-8' })).files[0].messages[0].complexityRules;
    deepEqual({ 'max-params': 7, 'complexity': 1 }, report1);
    const report2 = JSON.parse(execSync(cmd2, { encoding: 'utf-8' })).files[0].messages[0].complexityRules;
    deepEqual({ 'complexity': 1, 'max-params': 7, 'max-statements': 1 }, report2);
  }

  ['test: --no-inline-config']() {
    const cmd1 = 'node source/cli.js test/src/complexity__inline_config_for_file.js --format json';
    const messages1 = JSON.parse(execSync(cmd1, { encoding: 'utf-8' })).files[0].messages;
    equal(0, messages1.length);
    const cmd2 = 'node source/cli.js test/src/complexity__inline_config_for_file.js --format json --no-inline-config';
    const messages2 = JSON.parse(execSync(cmd2, { encoding: 'utf-8' })).files[0].messages;
    equal(1, messages2.length);

    const cmd3 = 'node source/cli.js test/src/complexity__inline_config.js --format json';
    const messages3 = JSON.parse(execSync(cmd3, { encoding: 'utf-8' })).files[0].messages;
    equal(2, messages3.length);
    deepEqual({ 'complexity': 1 }, messages3[0].complexityRules);
    deepEqual({ 'max-params': 13, 'complexity': 1 }, messages3[1].complexityRules);
    const cmd4 = 'node source/cli.js test/src/complexity__inline_config.js --format json --no-inline-config';
    const messages4 = JSON.parse(execSync(cmd4, { encoding: 'utf-8' })).files[0].messages;
    equal(4, messages4.length);
  }

  ['test: exitWithError']() {
    const cmd = 'node source/cli.js test/src/cli__exit_with_error.js';
    throws(() => {
      execSync(cmd, { encoding: 'utf-8', stdio: 'ignore' });
    });
  }

}


module.exports = TestCLI;
TestCLI.runIsMainModule();
