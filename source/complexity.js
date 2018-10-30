'use strict';

const { CLIEngine } = require('eslint');

const { purifyESLintConfigRules } = require('./lib/config');
const { patchComplexityRule } = require('./lib/complexity-rule');
const { Ranks } = require('./lib/rank');


// Setup hook for cleaning user-defined rules, because used only complexity rule
purifyESLintConfigRules();

// Patch a cyclomatic complexity rule for more usable for analyze
patchComplexityRule();


class Complexity {

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
    const rules = { complexity: ['error', this.options.greaterThan] };
    this.cli = new CLIEngine({ rules });
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
