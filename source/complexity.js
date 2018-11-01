'use strict';

const { patchingESLint, PatchedCLIEngine } = require('./lib/eslint-patches');
const { Ranks } = require('./lib/rank');


// Patching ESLint behavior, for use as a metrics generator
patchingESLint();


class ComplexityFileNodeReport {

  static getID(node) {
    return node.loc.start.line + ':' + node.loc.end.line;
  }

  static resolveNodeName(node) {
    const parent = node.parent;
    switch (node.type) {
      case 'FunctionExpression':
      case 'ClassBody':
      case 'AssignmentExpression':
      case 'ExpressionStatement':
      case 'BlockStatement':
      case 'ObjectExpression':
      case 'NewExpression':
      case 'ReturnStatement':
      case 'CallExpression':
        return this.resolveNodeName(parent);
      case 'FunctionDeclaration':
        if (parent.type === 'Program') {
          return 'function ' + node.id.name;
        }
        return this.resolveNodeName(parent) + ', function ' + node.id.name;
      case 'ArrowFunctionExpression':
        return this.resolveNodeName(parent) + ', arrow function';
      case 'MethodDefinition':
        return this.resolveNodeName(parent) + (node.static ? '.' : '#') + node.key.name;
      case 'ClassDeclaration':
        if (parent.type === 'Program') {
          return 'class ' + node.id.name;
        }
        return this.resolveNodeName(parent) + ', class ' + node.id.name;
      case 'Property':
        if (node.method) {
          return this.resolveNodeName(parent) + ', function ' + node.key.name;
        }
        return this.resolveNodeName(parent);
      default:
        return 'anonymous';
    }
  }

  constructor(node) {
    this.startLine = node.loc.start.line;
    this.endLine = node.loc.end.line;
    this.namePath = this.constructor.resolveNodeName(node);
    this.complexity = {};
  }

  pushData(ruleId, data) {
    switch (ruleId) {
      case 'complexity':
        this.complexity[ruleId] = data.complexity;
        break;
      default:
        throw new Error(`Unknown rule ID: ${ruleId}`);
    }
  }

}


class ComplexityFileReport {

  constructor(fileName) {
    this.fileName = fileName;
    this.nodes = new Map();
  }

  pushNodeMessage(ruleId, message) {
    const nodeID = ComplexityFileNodeReport.getID(message.node);
    let node = null;
    if (this.nodes.has(nodeID)) {
      node = this.nodes.get(nodeID);
    } else {
      node = new ComplexityFileNodeReport(message.node);
      this.nodes.set(nodeID, node);
    }
    node.pushData(ruleId, message.data);
  }

}


class ComplexityReport {

  static get nodeRulesIds() {
    return ['complexity'];
  }

  constructor() {
    this.nodeRulesIds = this.constructor.nodeRulesIds;
    this.files = {};
  }

  pushFile(fileName) {
    this.files[fileName] = new ComplexityFileReport(fileName);
  }

  pushMessage(fileName, ruleId, message) {
    const fileReport = this.files[fileName];
    if (this.nodeRulesIds.includes(ruleId)) {
      fileReport.pushNodeMessage(ruleId, message);
    } else {
      throw new Error(`Unknown rule ID: ${ruleId}`);
    }
  }

  finishFile(fileName) {
    console.log('finishFile', fileName);
  }

}


class Complexity {

  get complexityRules() {
    return {
      'complexity': ['error', 0],
      // 'max-depth': ['error', 0],
      // 'max-len': ['error', 1], // TODO: https://github.com/IgorNovozhilov/eslintcc/issues/1
      // 'max-lines': ['error', 0],
      // 'max-lines-per-function': ['error', { max: 0 }],
      // 'max-nested-callbacks': ['error', 0],
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
