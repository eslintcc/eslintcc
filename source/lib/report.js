'use strict';

const { Ranks } = require('./rank');

const functionNodeTypes = ['FunctionExpression', 'FunctionDeclaration'];
const nodeTypesNames = {
  'ArrowFunctionExpression': 'arrow function'
};
const ruleTypes = {
  'complexity': 'function',
  'max-depth': 'block',
  //'max-len': 'line',
  'max-lines': 'file',
  'max-lines-per-function': 'function',
  'max-nested-callbacks': 'function',
  'max-params': 'function',
  'max-statements': 'function'
};


class MessageNode {

  constructor(node) {
    this.node = node;
  }

  get position() {
    const { start, end } = this.node.loc;
    return `${start.line}:${start.column}-${end.line}:${end.column}`;
  }

  getFunctionName() {
    const node = this.node;
    if (node.id) {
      return `function ${node.id.name}`;
    } else {
      const parent = node.parent;
      switch (parent.type) {
        case 'MethodDefinition':
          return 'class ' + parent.parent.parent.id.name +
            (parent.static ? '.' : '#') +
            (parent.key.name || parent.key.raw);
        case 'Property':
          return `function ${parent.key.name || parent.key.raw}`;
        case 'VariableDeclarator':
          return `function ${parent.id.name}`;
        default:
          return `function anonymous (${this.position})`;
      }
    }
  }

  getNameInParentFunction() {
    const node = this.node;
    let name = `${nodeTypesNames[node.type] || node.type} (${this.position})`;
    let parent = node.parent;
    while (parent) {
      if (functionNodeTypes.includes(parent.type)) {
        name = new this.constructor(parent).getFunctionName() + ', ' + name;
        break;
      }
      parent = parent.parent;
    }
    return name;
  }

  getName() {
    const node = this.node;
    if (functionNodeTypes.includes(node.type)) {
      return this.getFunctionName();
    } else {
      return this.getNameInParentFunction();
    }
  }

}


class ComplexityMessageReport {

  static['resolveValue:complexity'](data) {
    return data.complexity;
  }

  static['resolveValue:max-depth'](data) {
    return data.depth;
  }

  static['resolveValue:max-lines'](data) {
    return data.actual;
  }

  static['resolveValue:max-lines-per-function'](data) {
    return data.lineCount;
  }

  static['resolveValue:max-nested-callbacks'](data) {
    return data.num;
  }

  static['resolveValue:max-params'](data) {
    return data.count;
  }

  static['resolveValue:max-statements'](data) {
    return data.count;
  }

  constructor({ ruleType, node }, { ranks }) {
    this.options = { ranks };
    this.node = new MessageNode(node);
    this.loc = node.loc;
    this.type = ruleType;
    this.name = this.node.getName();
    this.rules = {};
    this.maxRule = null;
    this.max = { rank: 0 };
  }

  toJSON() {
    const json = {
      loc: this.loc,
      type: this.type,
      name: this.name,
      rules: this.rules,
      maxRule: this.maxRule
    };
    if (this.error) {
      json.error = this.error;
    }
    return json;
  }

  pushData(ruleId, data) {
    const value = this.constructor[`resolveValue:${ruleId}`](data);
    const { rank, label } = this.options.ranks.getValue(ruleId, value);
    this.rules[ruleId] = { value, rank, label };
    if (rank > this.max.rank) {
      this.maxRule = ruleId;
      this.max = this.rules[ruleId];
    }
  }

  pushFatalMessage(ruleId, message) {
    const { rank, label } = this.options.ranks.constructor.getMaxValue();
    this.maxRule = ruleId;
    this.max = this.rules[ruleId] = { value: 1, rank, label };
    this.error = message;
    this.fatal = true;
  }

}


class ComplexityFileReport {

  constructor(file, { ranks }) {
    this.options = { ranks };
    this.file = file;
    this.messagesMap = new Map();
    this.messages = [];
    this.average = { rank: 0 };
  }

  toJSON() {
    return {
      file: this.file,
      messages: this.messages,
      average: this.average
    };
  }

  __pushMessage(ruleType, node) {
    const message = new ComplexityMessageReport({ ruleType, node }, { ranks: this.options.ranks });
    this.messagesMap.set(node, message);
    this.messages.push(message);
    return message;
  }

  pushMessage({ ruleId, ruleType, node, data }) {
    node = node || {
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      type: 'Program',
      parent: null
    };
    const reportMessage = this.messagesMap.get(node) || this.__pushMessage(ruleType, node);
    reportMessage.pushData(ruleId, data);
  }

  pushFatalMessage({ ruleId, ruleType, line, column, message }) {
    const loc = { start: { line, column }, end: { line, column } };
    const node = { loc, type: 'Program', parent: null };
    const reportMessage = this.__pushMessage(ruleType, node);
    reportMessage.pushFatalMessage(ruleId, message);
  }

}


class ComplexityReport {

  constructor({ ranks, greaterThan, lessThan, maxRank, maxAverageRank }) {
    this.options = { ranks, greaterThan, lessThan, maxRank, maxAverageRank };
    this.files = [];
    this.average = { rank: 0 };
    this.ranks = Ranks.createRanksCounters();
    this.errors = {
      maxRank: 0,
      maxAverageRank: false
    };
  }

  toJSON() {
    return {
      files: this.files,
      average: this.average,
      ranks: this.ranks,
      errors: this.errors
    };
  }

  verifyFile(file, messages) {
    const fileReport = new ComplexityFileReport(file, this.options);
    messages.forEach(message => {
      if (message.fatal) {
        message.ruleId = 'fatal-error';
        message.ruleType = 'file';
        fileReport.pushFatalMessage(message);
      } else {
        message = message.message;
        message.ruleType = ruleTypes[message.ruleId];
        fileReport.pushMessage(message);
      }
    });
    fileReport.messages.forEach(message => {
      const { rank, label } = message.max;
      fileReport.average.rank += rank;
      this.ranks[label]++;
      if (rank > this.options.maxRank || message.fatal) {
        this.errors.maxRank++;
      }
    });
    fileReport.average.rank = Ranks.roundValue(fileReport.average.rank / fileReport.messages.length);
    fileReport.average.label = Ranks.getLabelByValue(fileReport.average.rank);
    this.average.rank += fileReport.average.rank;
    const { greaterThan, lessThan } = this.options;
    if (typeof greaterThan === 'number' || typeof lessThan === 'number') {
      const gt = typeof greaterThan === 'number' ? greaterThan : -Infinity;
      const lt = typeof lessThan === 'number' ? lessThan : Infinity;
      fileReport.messages = fileReport.messages.filter(message => {
        if (message.fatal) {
          return true;
        }
        const { rank } = message.max;
        if (rank <= gt) {
          fileReport.messagesMap.delete(message.node.node);
          return false;
        }
        if (rank > lt) {
          fileReport.messagesMap.delete(message.node.node);
          return false;
        }
        return true;
      });
    }
    this.files.push(fileReport);
    return fileReport;
  }

  finish() {
    this.average.rank = Ranks.roundValue(this.average.rank / this.files.length);
    this.average.label = Ranks.getLabelByValue(this.average.rank);
    if (this.average.rank > this.options.maxAverageRank) {
      this.errors.maxAverageRank = true;
    }
  }

}


exports.ComplexityReport = ComplexityReport;
