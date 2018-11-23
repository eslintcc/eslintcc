'use strict';

const { deepEqual } = require('assert').strict;
const { resolve } = require('path');

const { Test } = require('@ndk/test');

const { Complexity } = require('../');


class TestComplexity extends Test {

  get name() {
    return 'Complexity';
  }

  ['test: executeOnFiles']() {
    const complexity = new Complexity();
    const report = complexity.executeOnFiles(['test/src/complexity__messages.js']);

    deepEqual({
      'complexity-value': 0.2,
      'complexity-label': 'A'
    }, report.files[0].messages[0].complexityRanks);
    deepEqual({
      complexity: 1
    }, report.files[0].messages[0].complexityRules);

    deepEqual({
      'max-params-value': 2,
      'max-params-label': 'B',
      'complexity-value': 0.2,
      'complexity-label': 'A'
    }, report.files[0].messages[1].complexityRanks);
    deepEqual({
      'max-params': 2,
      'complexity': 1
    }, report.files[0].messages[1].complexityRules);

    deepEqual({
      'max-depth-label': 'A',
      'max-depth-value': 0.5
    }, report.files[0].messages[7].complexityRanks);
    deepEqual({
      'max-depth': 1
    }, report.files[0].messages[7].complexityRules);

    deepEqual({
      'max-depth-label': 'F',
      'max-depth-value': 6
    }, report.files[0].messages[18].complexityRanks);
    deepEqual({
      'max-depth': 12
    }, report.files[0].messages[18].complexityRules);

    deepEqual({
      'complexity-label': 'A',
      'complexity-value': 0.2,
      'max-nested-callbacks-label': 'A',
      'max-nested-callbacks-value': 0.333
    }, report.files[0].messages[20].complexityRanks);
    deepEqual({
      'complexity': 1,
      'max-nested-callbacks': 1
    }, report.files[0].messages[20].complexityRules);

  }

  ['test: Complexity toJSON']() {
    const complexity = new Complexity();
    const report = complexity.executeOnFiles(['test/src/complexity__messages_json.js']);
    deepEqual({
      'files': [{
        'fileName': resolve('test/src/complexity__messages_json.js'),
        'messages': [{
          'id': 'function/3:0/5:1',
          'view': 'function',
          'loc': { 'start': { 'line': 3, 'column': 0 }, 'end': { 'line': 5, 'column': 1 } },
          'namePath': 'function myFunc',
          'complexityRules': { 'complexity': 1 },
          'complexityRanks': { 'complexity-value': 0.2, 'complexity-label': 'A' },
          'maxValue': 0.2,
          'maxLabel': 'A'
        }]
      }]
    }, JSON.parse(JSON.stringify(report)));
  }

}


module.exports = TestComplexity;
TestComplexity.runIsMainModule();
