'use strict';

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
        return nameWithParent(node.key.name, node.static ? '.' : '#');
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

  constructor(messageID, messageType, node) {
    this.id = messageID;
    this.view = messageType.view;
    this.loc = node.loc;
    this.namePath = this.constructor.resolveNodeName(node);
    this.complexity = {};
  }

  pushData(ruleId, messageType, data) {
    const value = this.constructor[`resolveValue:${ruleId}`](data);
    this[messageType.type][ruleId] = value;
  }

}


class ComplexityFileReport {

  constructor(fileName) {
    this.fileName = fileName;
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

  __pushMessage(messageID, messageType, node) {
    const message = new ComplexityFileReportMessage(messageID, messageType, node);
    this.messagesViewsMap[messageType.view][messageID] = message;
    this.messagesMap[messageID] = message;
    this.messages.push(message);
    return message;
  }

  pushMessage(ruleId, messageType, rawMessage) {
    const messageID = ComplexityFileReportMessage.getID(messageType, rawMessage.node);
    const message = this.messagesMap[messageID] ||
      this.__pushMessage(messageID, messageType, rawMessage.node);
    message.pushData(ruleId, messageType, rawMessage.data);
  }

}


class ComplexityReport {

  static get ruleTypes() {
    return {
      'complexity': { type: 'complexity', view: 'function' },
      'max-depth': { type: 'complexity', view: 'block' },
      'max-nested-callbacks': { type: 'complexity', view: 'function' }
    };
  }

  constructor() {
    this.ruleTypes = this.constructor.ruleTypes;
    this.filesMap = {};
    this.files = [];
  }

  toJSON() {
    return {
      files: this.files
    };
  }

  pushFile(fileName) {
    const fileInstance = new ComplexityFileReport(fileName);
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
    console.log('finishFile', JSON.stringify(this.filesMap[fileName], null, '\t'));
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
      // 'max-params': ['error', 0],
      // 'max-statements': ['error', 0]
    };
  }

  constructor({
    greaterThan = 0,
    lessThan = Infinity,
    ranks = null
  } = {}) {
    this.ranks = new Ranks(ranks);
    this.options = {
      greaterThan: this.ranks[String(greaterThan).toUpperCase()] || Number(greaterThan),
      lessThan: this.ranks[String(lessThan).toUpperCase()] || Number(lessThan),
    };
  }

  // analyzeFileComplexity({ filePath, messages }) {
  //   const fileComplexity = { filePath, complexity: 0, messages: [] };
  //   for (const { column, endColumn, endLine, line, message, nodeType } of messages) {
  //     const { name, complexity, ruleMessage } = JSON.parse(message);
  //     const complexityData = { column, endColumn, endLine, line, nodeType, name, complexity, ruleMessage };
  //     complexityData.complexity = parseInt(complexityData.complexity);
  //     complexityData.rank = this.ranks.getName(complexityData.complexity);
  //     fileComplexity.messages.push(complexityData);
  //     fileComplexity.complexity += complexityData.complexity;
  //   }
  //   return fileComplexity;
  // }

  executeOnFiles(patterns) {
    const engine = new PatchedCLIEngine({ rules: this.complexityRules });
    const report = new ComplexityReport();
    engine.events
      .on('beforeFileVerify', report.pushFile.bind(report))
      .on('pushMessage', report.pushMessage.bind(report))
      .on('afterFileVerify', report.finishFile.bind(report));
    engine.executeOnFiles(patterns);
    engine.destroy();
    return report;
    // const report = this.cli.executeOnFiles(patterns).results;
    // const reportComplexity = { cwd: process.cwd(), complexity: 0, results: [] };
    // for (const fileReport of report) {
    //   const fileComplexity = this.analyzeFileComplexity(fileReport);
    //   reportComplexity.results.push(fileComplexity);
    //   reportComplexity.complexity += fileComplexity.complexity;
    // }
    // return reportComplexity;
  }

}


exports.Complexity = Complexity;
