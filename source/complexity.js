'use strict';

const { CLIEngine } = require('eslint');

const { patchingESLint } = require('./lib/eslint-patches');
const { Ranks } = require('./lib/rank');


// Patching ESLint behavior, for use as a metrics generator
patchingESLint();


class Complexity {

  get complexityRules() {
    return {
      complexity: ['error', 0]
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
    this.cli = new CLIEngine({ rules: this.complexityRules });
    this.originalVerify = this.cli.linter.verify.bind(this.cli.linter);
    this.cli.linter.verify = this.verify.bind(this);
  }

  verify(textOrSourceCode, config, filenameOrOptions) {
    const messages = this.originalVerify(textOrSourceCode, config, filenameOrOptions);
    return messages;
  }

  analyzeFileComplexity({ filePath, messages }) {
    const fileComplexity = { filePath, complexity: 0, messages: [] };
    for (const { column, endColumn, endLine, line, message, nodeType } of messages) {
      const { name, complexity, ruleMessage } = JSON.parse(message);
      const complexityData = { column, endColumn, endLine, line, nodeType, name, complexity, ruleMessage };
      complexityData.complexity = parseInt(complexityData.complexity);
      complexityData.rank = this.ranks.getName(complexityData.complexity);
      fileComplexity.messages.push(complexityData);
      fileComplexity.complexity += complexityData.complexity;
    }
    return fileComplexity;
  }

  executeOnFiles(patterns) {
    const report = this.cli.executeOnFiles(patterns).results;
    const reportComplexity = { cwd: process.cwd(), complexity: 0, results: [] };
    for (const fileReport of report) {
      const fileComplexity = this.analyzeFileComplexity(fileReport);
      reportComplexity.results.push(fileComplexity);
      reportComplexity.complexity += fileComplexity.complexity;
    }
    return reportComplexity;
  }

}


exports.Complexity = Complexity;
