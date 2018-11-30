'use strict';

const EventEmitter = require('events');

const { patchingESLint, PatchedCLIEngine } = require('./lib/eslint-patches');
const { Ranks } = require('./lib/rank');

const allComplexityRules = {
  'complexity': ['error', 0],
  'max-depth': ['error', 0],
  'max-len': ['error', 1], // TODO: https://github.com/IgorNovozhilov/eslintcc/issues/1
  'max-lines': ['error', 0],
  'max-lines-per-function': ['error', { max: 0 }],
  'max-nested-callbacks': ['error', 0],
  'max-params': ['error', 0],
  'max-statements': ['error', 0]
};
const ruleCategories = {
  all: allComplexityRules,
  logic: {
    'complexity': allComplexityRules['complexity'],
    'max-depth': allComplexityRules['max-depth'],
    'max-nested-callbacks': allComplexityRules['max-nested-callbacks'],
    'max-params': allComplexityRules['max-params']
  },
  raw: {
    'max-len': allComplexityRules['max-len'],
    'max-lines': allComplexityRules['max-lines'],
    'max-lines-per-function': allComplexityRules['max-lines-per-function'],
    'max-statements': allComplexityRules['max-statements']
  }
};
const ruleTypes = {
  'complexity': { type: 'complexity', view: 'function' },
  'max-depth': { type: 'complexity', view: 'block' },
  'max-nested-callbacks': { type: 'complexity', view: 'function' },
  'max-params': { type: 'complexity', view: 'function' }
};

// Patching ESLint behavior, for use as a metrics generator
patchingESLint();


class ComplexityFileReportMessage {

  static getID(ruleType, node) {
    const view = ruleType.view;
    const start = `${node.loc.start.line}:${node.loc.start.column}`;
    const end = `${node.loc.end.line}:${node.loc.end.column}`;
    return `${view}/${start}/${end}`;
  }

  static resolveNodeName(node, recursiveUp = false) {
    if (node === null) {
      return null;
    }
    const parent = node.parent;
    const nameWithParent = (name, separator = ', ') => {
      const parentName = this.resolveNodeName(parent, true);
      return parentName ? (parentName + separator + name) : name;
    };
    switch (node.type) {
      case 'FunctionExpression':
      case 'FunctionDeclaration':
        if (!node.id && (recursiveUp || node.loc.start.line === parent.loc.start.line)) {
          return this.resolveNodeName(parent, true) || (recursiveUp ? '' : 'function anonymous');
        } else {
          return nameWithParent('function ' + ((node.id || {}).name || 'anonymous'));
        }
      case 'MethodDefinition':
        return nameWithParent(node.key.name || node.key.raw, node.static ? '.' : '#');
      case 'ClassDeclaration':
        return nameWithParent('class ' + node.id.name);
      case 'VariableDeclarator':
        return nameWithParent('variable ' + node.id.name);
      case 'Property':
        if (node.method) {
          return nameWithParent('function ' + (node.key.name || node.key.raw));
        }
        return this.resolveNodeName(parent, true);
      case 'ArrowFunctionExpression':
        return nameWithParent(`${node.type}:${node.loc.start.line}-${node.loc.end.line}`);
      default:
        if (recursiveUp || node.loc.start.line === parent.loc.start.line) {
          return this.resolveNodeName(parent, true);
        } else {
          return nameWithParent(`${node.type}:${node.loc.start.line}-${node.loc.end.line}`);
        }
    }
  }

  static['resolveValue:complexity'](data) {
    return data.complexity;
  }

  static['resolveValue:max-depth'](data) {
    return data.depth;
  }

  static['resolveValue:max-nested-callbacks'](data) {
    return data.num;
  }

  static['resolveValue:max-params'](data) {
    return data.count;
  }

  constructor({ messageID, ruleType, node }, { ranks }) {
    this.ranks = ranks;
    this.id = messageID;
    this.view = ruleType.view;
    this.loc = node.loc;
    this.namePath = this.constructor.resolveNodeName(node);
    this.complexityRules = {};
    this.complexityRanks = {};
    this.maxRuleValue = 0;
    this.maxRuleId = null;
    this.maxValue = 0;
    this.maxLabel = null;
  }

  toJSON() {
    return {
      id: this.id,
      view: this.view,
      loc: this.loc,
      namePath: this.namePath,
      complexityRules: this.complexityRules,
      complexityRanks: this.complexityRanks,
      maxValue: this.maxValue,
      maxLabel: this.maxLabel
    };
  }

  pushData(ruleId, ruleType, data) {
    const value = this.constructor[`resolveValue:${ruleId}`](data);
    const { rankValue, rankLabel } = this.ranks.getValue(ruleId, value);
    this[`${ruleType.type}Rules`][ruleId] = value;
    this[`${ruleType.type}Ranks`][`${ruleId}-value`] = rankValue;
    this[`${ruleType.type}Ranks`][`${ruleId}-label`] = rankLabel;
    if (rankValue > this.maxValue) {
      this.maxRuleValue = value;
      this.maxRuleId = ruleId;
      this.maxValue = rankValue;
      this.maxLabel = rankLabel;
    }
  }

}


class ComplexityFileReport {

  constructor(fileName, { ranks }) {
    this.fileName = fileName;
    this.ranks = ranks;
    this.messagesViewsMap = { function: {}, block: {} };
    this.messagesMap = {};
    this.messages = [];
  }

  toJSON() {
    return {
      fileName: this.fileName,
      messages: this.messages
    };
  }

  __pushMessage({ messageID, ruleType, node }) {
    const message = new ComplexityFileReportMessage({ messageID, ruleType, node }, { ranks: this.ranks });
    this.messagesViewsMap[ruleType.view][messageID] = message;
    this.messagesMap[messageID] = message;
    this.messages.push(message);
    return message;
  }

  pushMessage({ ruleId, ruleType, node, data }) {
    const messageID = ComplexityFileReportMessage.getID(ruleType, node);
    const message = this.messagesMap[messageID] || this.__pushMessage({ messageID, ruleType, node });
    message.pushData(ruleId, ruleType, data);
  }

}


class ComplexityReport {

  constructor({ ranks, greaterThan, lessThan }) {
    this.options = { ranks, greaterThan, lessThan };
    this.events = new EventEmitter();
    this.files = [];
  }

  toJSON() {
    return {
      files: this.files
    };
  }

  verifyFile(fileName, messages) {
    const fileReport = new ComplexityFileReport(fileName, this.options);
    messages.forEach(({ message }) => {
      message.ruleType = ruleTypes[message.ruleId];
      fileReport.pushMessage(message);
    });
    if (this.options.greaterThan || this.options.lessThan) {
      const greaterThan = this.options.greaterThan || -Infinity;
      const lessThan = (this.options.lessThan || Infinity);
      fileReport.messages = fileReport.messages.filter(message => {
        if (message.maxValue <= greaterThan) {
          return false;
        }
        if (message.maxValue > lessThan) {
          return false;
        }
        return true;
      });
    }
    this.files.push(fileReport);
    this.events.emit('verifyFile', fileReport);
  }

}


class Complexity {

  constructor({
    rules = 'logic',
    greaterThan = undefined,
    lessThan = undefined,
    ranks = null
  } = {}) {
    this.options = {
      ranks: new Ranks(ranks),
      rules: rules,
      greaterThan: Ranks.getLabelMaxValue(greaterThan),
      lessThan: Ranks.getLabelMinValue(lessThan),
    };
    this.events = new EventEmitter();
  }

  getComplexityRules(customCategory) {
    const category = customCategory || this.options.rules;
    if (category in allComplexityRules) {
      return {
        [category]: allComplexityRules[category]
      };
    } else if (category in ruleCategories) {
      return ruleCategories[category];
    } else {
      return ruleCategories['logic'];
    }
  }

  executeOnFiles(patterns) {
    const engine = new PatchedCLIEngine({ rules: this.getComplexityRules() });
    const report = new ComplexityReport(this.options);
    engine.events.on('verifyFile', report.verifyFile.bind(report));
    report.events.on('verifyFile', (...args) => this.events.emit('verifyFile', ...args));
    engine.executeOnFiles(patterns);
    this.events.emit('finish', report);
    return report;
  }

}


exports.Complexity = Complexity;
