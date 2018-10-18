'use strict';

const { CLIEngine } = require('eslint');

const { purifyESLintConfigRules } = require('./lib/config');

const defaultComplexity = 0;
const complexityRE = /.*complexity of (\d+)..*/;


// Setup hook for cleaning user-defined rules, because used only complexity rule
purifyESLintConfigRules();


class Complexity {

  constructor({ complexity = defaultComplexity } = {}) {
    const rules = { complexity: ['error', complexity] };
    this.cli = new CLIEngine({ rules });
  }

  static analyzeFileComplexity({ filePath, messages }) {
    const fileComplexity = { filePath, complexity: 0, messages: [] };
    for (const { column, endColumn, endLine, line, message, nodeType } of messages) {
      const complexityMessage = { column, endColumn, endLine, line, message, nodeType };
      complexityMessage.complexity = parseInt(message.replace(complexityRE, '$1'));
      fileComplexity.messages.push(complexityMessage);
      fileComplexity.complexity += complexityMessage.complexity;
    }
    return fileComplexity;
  }

  executeOnFiles(patterns) {
    const report = this.cli.executeOnFiles(patterns).results;
    const reportComplexity = { complexity: 0, results: [] };
    for (const fileReport of report) {
      const fileComplexity = Complexity.analyzeFileComplexity(fileReport);
      reportComplexity.results.push(fileComplexity);
      reportComplexity.complexity += fileComplexity.complexity;
    }
    return reportComplexity;
  }

}


exports.Complexity = Complexity;
