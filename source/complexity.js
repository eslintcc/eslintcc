'use strict';

const { CLIEngine } = require('eslint');

const useEslintrc = false;
const defaultComplexity = 0;
const complexityRE = /.*complexity of (\d+)..*/;


class Complexity {

  constructor({ complexity = defaultComplexity } = {}) {
    // TODO: Нужен простой поиск файла, без загрузки, иначе падает поиск модулей из опции extends
    const { parser, parserOptions } = new CLIEngine().getConfigForFile();
    const rules = { complexity: ['error', complexity] };
    this.cli = new CLIEngine({ parser, parserOptions, useEslintrc, rules });
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
