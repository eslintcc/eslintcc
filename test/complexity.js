'use strict';

const { equal, deepEqual } = require('assert').strict;
const { resolve } = require('path');

const { Test } = require('@ndk/test');

const { Complexity } = require('../');


class TestComplexity extends Test {

  get name() {
    return 'Complexity';
  }

  ['test: #executeOnFiles']() {
    const complexity = new Complexity();
    const report = complexity.executeOnFiles(['test/src/complexity__messages.js']);

    equal('function myFunc', report.files[0].messages[0].namePath);
    deepEqual({
      'complexity-value': 0.2,
      'complexity-label': 'A'
    }, report.files[0].messages[0].complexityRanks);
    deepEqual({
      complexity: 1
    }, report.files[0].messages[0].complexityRules);

    equal('function myFunc1', report.files[0].messages[1].namePath);
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

    equal('function myFunc2', report.files[0].messages[2].namePath);
    deepEqual({
      'max-params-value': 3,
      'max-params-label': 'C',
      'complexity-value': 0.2,
      'complexity-label': 'A'
    }, report.files[0].messages[2].complexityRanks);
    deepEqual({
      'max-params': 3,
      'complexity': 1
    }, report.files[0].messages[2].complexityRules);

    equal('function myFunc3', report.files[0].messages[3].namePath);
    deepEqual({
      'max-params-value': 3.5,
      'max-params-label': 'D',
      'complexity-value': 0.2,
      'complexity-label': 'A'
    }, report.files[0].messages[3].complexityRanks);
    deepEqual({
      'max-params': 4,
      'complexity': 1
    }, report.files[0].messages[3].complexityRules);

    equal('function myFunc7, IfStatement:48-72', report.files[0].messages[8].namePath);
    deepEqual({
      'max-depth-label': 'A',
      'max-depth-value': 0.5
    }, report.files[0].messages[8].complexityRanks);
    deepEqual({
      'max-depth': 1
    }, report.files[0].messages[8].complexityRules);

    equal('function myFunc7, IfStatement:59-61', report.files[0].messages[19].namePath);
    deepEqual({
      'max-depth-label': 'F',
      'max-depth-value': 5.5
    }, report.files[0].messages[19].complexityRanks);
    deepEqual({
      'max-depth': 12
    }, report.files[0].messages[19].complexityRules);

    equal('function myFunc8, ArrowFunctionExpression:78-80', report.files[0].messages[21].namePath);
    deepEqual({
      'complexity-label': 'A',
      'complexity-value': 0.2,
      'max-nested-callbacks-label': 'A',
      'max-nested-callbacks-value': 0.333
    }, report.files[0].messages[21].complexityRanks);
    deepEqual({
      'complexity': 1,
      'max-nested-callbacks': 1
    }, report.files[0].messages[21].complexityRules);
  }

  ['test: #toJSON']() {
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

  ['test: ~greaterThan']() {
    const complexity = new Complexity();
    const messages = complexity.executeOnFiles(['test/src/complexity__messages_gtlt.js']).files[0].messages;
    equal('A', messages[0].maxLabel);
    equal('B', messages[1].maxLabel);
    equal('C', messages[2].maxLabel);
    equal('F', messages[3].maxLabel);
    equal('F', messages[4].maxLabel);
    const complexityB = new Complexity({ greaterThan: 'B' });
    const messagesB = complexityB.executeOnFiles(['test/src/complexity__messages_gtlt.js']).files[0].messages;
    equal('C', messagesB[0].maxLabel);
    equal('F', messagesB[1].maxLabel);
    equal('F', messagesB[2].maxLabel);
    equal(undefined, messagesB[3]);
    const complexityE = new Complexity({ greaterThan: 'E' });
    const messagesE = complexityE.executeOnFiles(['test/src/complexity__messages_gtlt.js']).files[0].messages;
    equal('F', messagesE[0].maxLabel);
    equal('F', messagesE[1].maxLabel);
    equal(undefined, messagesE[2]);
    const complexityN = new Complexity({ greaterThan: 6 });
    const messagesN = complexityN.executeOnFiles(['test/src/complexity__messages_gtlt.js']).files[0].messages;
    equal('F', messagesN[0].maxLabel);
    equal(undefined, messagesN[1]);
  }

  ['test: ~lessThan']() {
    const complexityB = new Complexity({ lessThan: 'B' });
    const messagesB = complexityB.executeOnFiles(['test/src/complexity__messages_gtlt.js']).files[0].messages;
    equal('A', messagesB[0].maxLabel);
    equal(undefined, messagesB[1]);
    const complexityE = new Complexity({ lessThan: 'E' });
    const messagesE = complexityE.executeOnFiles(['test/src/complexity__messages_gtlt.js']).files[0].messages;
    equal('A', messagesE[0].maxLabel);
    equal('B', messagesE[1].maxLabel);
    equal('C', messagesE[2].maxLabel);
    equal(undefined, messagesE[3]);
    const complexityN = new Complexity({ lessThan: 0.5 });
    const messagesN = complexityN.executeOnFiles(['test/src/complexity__messages_gtlt.js']).files[0].messages;
    equal('A', messagesN[0].maxLabel);
    equal(undefined, messagesN[1]);
  }

  ['test: ~resolveNodeName']() {
    const messages = new Complexity()
      .executeOnFiles(['test/src/complexity__messages_node_name.js'])
      .files[0].messages;
    equal('function myFunc1', messages[0].namePath);
    equal('variable myFunc2', messages[1].namePath);
    equal('function anonymous', messages[2].namePath);
    equal('function anonymous', messages[3].namePath);
    equal('function myFunc3', messages[4].namePath);
    equal('class myClass1#constructor', messages[5].namePath);
    equal('class myClass1#myMethod1', messages[6].namePath);
    equal('class myClass1#myProp1', messages[7].namePath);
    equal('class myClass1.myMethod1', messages[8].namePath);
    equal('class myClass1.myProp1', messages[9].namePath);
    equal('class myClass1.\'my method 2\'', messages[10].namePath);
    equal('variable mo1, function \'my method 3\'', messages[11].namePath);
    equal('variable arr1, ArrowFunctionExpression:38-42', messages[12].namePath);
    equal('variable arr1, ArrowFunctionExpression:38-42, ArrowFunctionExpression:39-41', messages[13].namePath);
    equal('function anonymous', messages[14].namePath);
    equal('function anonymous', messages[15].namePath);
    equal('IfStatement:48-52', messages[16].namePath);
    equal('IfStatement:49-51', messages[17].namePath);
    equal('variable mo2, function myMethod5', messages[18].namePath);
    equal('variable myFunc4, function anonymous', messages[19].namePath);
  }

}


module.exports = TestComplexity;
TestComplexity.runIsMainModule();
