'use strict';

const EventEmitter = require('events');

const { patchingESLint, PatchedCLIEngine } = require('./lib/eslint-patches');
const { Ranks } = require('./lib/rank');


// Patching ESLint behavior, for use as a metrics generator
patchingESLint();


class ComplexityFileReportMessage {

  static getID(messageType, node) {
    const view = messageType.view;
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
      const parentNamr = this.resolveNodeName(parent, true);
      return parentNamr ? (parentNamr + separator + name) : name;
    };
    switch (node.type) {
      case 'FunctionDeclaration':
        return nameWithParent('function ' + node.id.name);
      case 'MethodDefinition':
        return nameWithParent(node.key.name || node.key.raw, node.static ? '.' : '#');
      case 'ClassDeclaration':
        return nameWithParent('class ' + node.id.name);
      case 'VariableDeclarator':
        return nameWithParent('variable ' + node.id.name);
      case 'Property':
        if (node.method) {
          return nameWithParent('function ' + node.key.name);
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

  constructor({ messageID, messageType, messageNode }, { ranks }) {
    this.ranks = ranks;
    this.id = messageID;
    this.view = messageType.view;
    this.loc = messageNode.loc;
    this.namePath = this.constructor.resolveNodeName(messageNode);
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

  pushData(ruleId, messageType, data) {
    const value = this.constructor[`resolveValue:${ruleId}`](data);
    const { rankValue, rankLabel } = this.ranks.getValue(ruleId, value);
    this[`${messageType.type}Rules`][ruleId] = value;
    this[`${messageType.type}Ranks`][`${ruleId}-value`] = rankValue;
    this[`${messageType.type}Ranks`][`${ruleId}-label`] = rankLabel;
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

  __pushMessage({ messageID, messageType, messageNode }) {
    const message = new ComplexityFileReportMessage({ messageID, messageType, messageNode }, { ranks: this.ranks });
    this.messagesViewsMap[messageType.view][messageID] = message;
    this.messagesMap[messageID] = message;
    this.messages.push(message);
    return message;
  }

  pushMessage(ruleId, messageType, rawMessage) {
    const messageID = ComplexityFileReportMessage.getID(messageType, rawMessage.node);
    const message = this.messagesMap[messageID] ||
      this.__pushMessage({
        messageID,
        messageType,
        messageNode: rawMessage.node
      });
    message.pushData(ruleId, messageType, rawMessage.data);
  }

}


class ComplexityReport {

  static get ruleTypes() {
    return {
      'complexity': { type: 'complexity', view: 'function' },
      'max-depth': { type: 'complexity', view: 'block' },
      'max-nested-callbacks': { type: 'complexity', view: 'function' },
      'max-params': { type: 'complexity', view: 'function' }
    };
  }

  constructor({ ranks }) {
    this.ranks = ranks;
    this.ruleTypes = this.constructor.ruleTypes;
    this.filesMap = {};
    this.files = [];
    this.events = new EventEmitter();
  }

  toJSON() {
    return {
      files: this.files
    };
  }

  pushFile(fileName) {
    const fileInstance = new ComplexityFileReport(fileName, { ranks: this.ranks });
    this.filesMap[fileName] = fileInstance;
    this.files.push(fileInstance);
  }

  pushMessage(fileName, ruleId, message) {
    const fileReport = this.filesMap[fileName];
    const messageType = this.ruleTypes[ruleId];
    if (typeof messageType === 'undefined') {
      throw new Error(`Unknown rule ID: ${ruleId}`);
    } else {
      fileReport.pushMessage(ruleId, messageType, message);
    }
  }

  finishFile(fileName) {
    this.events.emit('finishFile', this.filesMap[fileName]);
  }

}


class Complexity {

  get complexityRules() {
    return {
      'complexity': ['error', 0],
      'max-depth': ['error', 0],
      // 'max-len': ['error', 1], // TODO: https://github.com/IgorNovozhilov/eslintcc/issues/1
      // 'max-lines': ['error', 0],
      // 'max-lines-per-function': ['error', { max: 0 }],
      'max-nested-callbacks': ['error', 0],
      'max-params': ['error', 0],
      // 'max-statements': ['error', 0]
    };
  }

  constructor({
    greaterThan = undefined,
    lessThan = undefined,
    ranks = null
  } = {}) {
    this.ranks = new Ranks(ranks);
    this.options = {
      greaterThan: this.ranks.getLabelMaxValue(greaterThan),
      lessThan: this.ranks.getLabelMaxValue(lessThan),
    };
    this.events = new EventEmitter();
  }

  executeOnFiles(patterns) {
    const engine = new PatchedCLIEngine({ rules: this.complexityRules });
    const report = new ComplexityReport({ ranks: this.ranks });
    engine.events
      .on('beforeFileVerify', report.pushFile.bind(report))
      .on('pushMessage', report.pushMessage.bind(report))
      .on('afterFileVerify', report.finishFile.bind(report));
    report.events.on('finishFile', (...args) => this.events.emit('finishFile', ...args));
    engine.executeOnFiles(patterns);
    engine.destroy();
    this.events.emit('finish', report);
    return report;
  }

}


exports.Complexity = Complexity;
