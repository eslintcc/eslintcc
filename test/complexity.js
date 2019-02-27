'use strict';

const { equal, deepEqual } = require('assert').strict;
const { resolve } = require('path');

const { Test } = require('@ndk/test');

const { Complexity } = require('../');


class TestComplexity extends Test {

  get name() {
    return 'Complexity';
  }

  constructor() {
    super();
    this.rules = {
      all: [
        'complexity', 'max-depth',
        // 'max-len',
        'max-lines', 'max-lines-per-function',
        'max-nested-callbacks', 'max-params', 'max-statements'
      ],
      logic: [
        'complexity', 'max-depth', 'max-nested-callbacks', 'max-params'
      ],
      raw: [
        // 'max-len',
        'max-lines', 'max-lines-per-function', 'max-statements'
      ]
    };
  }

  ['test: #getComplexityRules']() {
    const complexity = new Complexity();
    deepEqual(this.rules.logic, Object.keys(complexity.getComplexityRules()));
    deepEqual(complexity.getComplexityRules('logic'), complexity.getComplexityRules());
    deepEqual(complexity.getComplexityRules('error'), complexity.getComplexityRules('logic'));
    deepEqual(this.rules.all, Object.keys(complexity.getComplexityRules('all')));
    deepEqual(this.rules.raw, Object.keys(complexity.getComplexityRules('raw')));
    deepEqual(['complexity'], Object.keys(complexity.getComplexityRules('complexity')));
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

  ['test: #executeOnFiles (complexity)']() {
    const file = 'test/src/complexity__one_rule.js';
    const complexity = new Complexity();
    const report = complexity.executeOnFiles([file]).files[0].messages[0];
    equal('max-params', report.maxRuleId);
    deepEqual({ 'max-params': 7, 'complexity': 1 }, report.complexityRules);
    const onlyComplexity = new Complexity({ rules: 'complexity' });
    const onlyCReport = onlyComplexity.executeOnFiles([file]).files[0].messages[0];
    equal('complexity', onlyCReport.maxRuleId);
    deepEqual({ 'complexity': 1 }, onlyCReport.complexityRules);
  }

  ['test: #executeOnFiles (raw rules)']() {
    const file = 'test/src/complexity__raw_rules.js';
    const complexity = new Complexity();
    const report = complexity.executeOnFiles([file]).files[0].messages[0];
    equal('max-params', report.maxRuleId);
    deepEqual({ 'max-params': 7, 'complexity': 1 }, report.complexityRules);
    const rawComplexity = new Complexity({ rules: 'raw' });
    const rawReport = rawComplexity.executeOnFiles([file]).files[0].messages;
    equal('max-lines', rawReport[0].maxRuleId);
    deepEqual({
      'max-lines': 13
    }, rawReport[0].complexityRules);
    deepEqual({
      'max-lines-label': 'A',
      'max-lines-value': 0.173
    }, rawReport[0].complexityRanks);
    equal('max-statements', rawReport[1].maxRuleId);
    deepEqual({
      'max-lines-per-function': 8,
      'max-statements': 4
    }, rawReport[1].complexityRules);
    deepEqual({
      'max-lines-per-function-label': 'A',
      'max-lines-per-function-value': 0.615,
      'max-statements-label': 'B',
      'max-statements-value': 1.5
    }, rawReport[1].complexityRanks);
  }

  ['test: #executeOnFiles (parse Error: Fatal)']() {
    const file = 'test/src/complexity__fatal.js';
    const complexity = new Complexity();
    const report = complexity.executeOnFiles([file]).files[0].messages[0];
    deepEqual({ 'fatal-error-label': 'F', 'fatal-error-value': 6 }, report.complexityRanks);
    deepEqual({ 'fatal-error': 1 }, report.complexityRules);
    equal('4:3:4:3', report.id);
    equal('F', report.maxLabel);
    equal('fatal-error', report.maxRuleId);
    equal(1, report.maxRuleValue);
    equal(6, report.maxValue);
    equal("Parsing error: The keyword 'let' is reserved", report.errorMessage);
    equal('Program:4:3', report.namePath);
    equal('file', report.type);
  }

  ['test: #executeOnFiles (parse Error: Fatal, JSON)']() {
    const file = 'test/src/complexity__fatal.js';
    const complexity = new Complexity();
    const report = JSON.stringify(complexity.executeOnFiles([file]).files[0].messages[0]);
    deepEqual({
      'id': '4:3:4:3',
      'type': 'file',
      'loc': { 'start': { 'line': 4, 'column': 3 }, 'end': { 'line': 4, 'column': 3 } },
      'namePath': 'Program:4:3',
      'complexityRules': { 'fatal-error': 1 },
      'complexityRanks': { 'fatal-error-value': 6, 'fatal-error-label': 'F' },
      'maxValue': 6,
      'maxLabel': 'F',
      'errorMessage': "Parsing error: The keyword 'let' is reserved"
    }, JSON.parse(report));
  }

  ['test: #toJSON']() {
    const complexity = new Complexity();
    const report = complexity.executeOnFiles(['test/src/complexity__messages_json.js']);
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
        'fileName': resolve('test/src/complexity__messages_json.js'),
        'messages': [{
          'id': '3:0:5:1',
          'type': 'function',
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
    equal('variable mo3, function myFunc5', messages[20].namePath);
    equal('variable mo3, function myFunc7', messages[21].namePath);
  }

  ['test: ~noInlineConfig']() {
    const messages1 = new Complexity()
      .executeOnFiles(['test/src/complexity__inline_config_for_file.js'])
      .files[0].messages;
    equal(0, messages1.length);
    const messages2 = new Complexity({ noInlineConfig: true })
      .executeOnFiles(['test/src/complexity__inline_config_for_file.js'])
      .files[0].messages;
    equal(1, messages2.length);

    const messages3 = new Complexity()
      .executeOnFiles(['test/src/complexity__inline_config.js'])
      .files[0].messages;
    equal(2, messages3.length);
    deepEqual({ 'complexity': 1 }, messages3[0].complexityRules);
    deepEqual({ 'max-params': 13, 'complexity': 1 }, messages3[1].complexityRules);
    const messages4 = new Complexity({ noInlineConfig: true })
      .executeOnFiles(['test/src/complexity__inline_config.js'])
      .files[0].messages;
    equal(4, messages4.length);
  }

  ['test: ~averageRank']() {
    const report = new Complexity().executeOnFiles(['test/src/complexity__average_rank']);
    equal(3.416, report.averageRankValue);
    equal('D', report.averageRank);
  }

  ['test: ~maxRank']() {
    const file = 'test/src/complexity__max_rank.js';
    const complexity = new Complexity();
    const report = complexity.executeOnFiles([file]);
    deepEqual({ maxAverageRank: false, maxRank: 1 }, report.errors);
  }

  ['test: ~maxRank + ~greaterThan']() {
    const file = 'test/src/complexity__max_rank.js';
    const complexity = new Complexity({ greaterThan: 'E' });
    const report = complexity.executeOnFiles([file]);
    equal(0, report.files[0].messages.length);
    deepEqual({ maxAverageRank: false, maxRank: 1 }, report.errors);
  }

  ['test: ~maxRank + ~maxAverageRank + ~greaterThan (3.5)']() {
    const file = 'test/src/complexity__max_average_rank_3_5.js';
    const complexity = new Complexity({
      greaterThan: 'E',
      maxRank: 3.5,
      maxAverageRank: 3.5
    });
    const report = complexity.executeOnFiles([file]);
    equal(3, report.files[0].messages.length);
    deepEqual({ maxAverageRank: false, maxRank: 6 }, report.errors);
  }

  ['test: ~maxAverageRank']() {
    const file = 'test/src/complexity__max_average_rank.js';
    const complexity = new Complexity();
    const report = complexity.executeOnFiles([file]);
    deepEqual({ maxAverageRank: true, maxRank: 0 }, report.errors);
  }

  ['test: ~maxRank + ~maxAverageRank (parse Error: Fatal)']() {
    const file = 'test/src/complexity__fatal.js';
    const complexity = new Complexity();
    const report = complexity.executeOnFiles([file]);
    equal(1, report.files[0].messages.length);
    deepEqual({ maxAverageRank: true, maxRank: 1 }, report.errors);
  }

  ['test: ~maxRank + ~maxAverageRank + ~greaterThan F (parse Error: Fatal)']() {
    const file = 'test/src/complexity__fatal.js';
    const complexity = new Complexity({
      greaterThan: 'F',
      maxRank: 'F',
      maxAverageRank: 'F'
    });
    const report = complexity.executeOnFiles([file]);
    equal(1, report.files[0].messages.length);
    deepEqual({ maxAverageRank: false, maxRank: 1 }, report.errors);
  }

}


module.exports = TestComplexity;
TestComplexity.runIsMainModule();
