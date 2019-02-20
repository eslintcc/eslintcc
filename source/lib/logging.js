'use strict';

const { relative } = require('path');

class ReportLogger {

  get defaultColors() {
    return {
      A: '\x1b[32;1mA\x1b[0m',
      B: '\x1b[32;1mB\x1b[0m',
      C: '\x1b[33;1mC\x1b[0m',
      D: '\x1b[33;1mD\x1b[0m',
      E: '\x1b[31;1mE\x1b[0m',
      F: '\x1b[31;1mF\x1b[0m'
    };
  }

  get defaultErrorColor() {
    return '\x1b[31;1mError\x1b[0m';
  }

  constructor(complexity, {
    cwd = process.cwd(),
    format = 'text',
    average = false,
    showRules = false,
    logger = console.log
  }) {
    this.complexity = complexity;
    this.options = { cwd, format, average, showRules };
    this.logger = logger;
    this.colors = this.defaultColors;
    this.errorColor = this.defaultErrorColor;
    this.complexity.events
      .on('verifyFile', this.verifyFile.bind(this))
      .on('finish', this.finish.bind(this));
  }

  verifyFile(fileReport) {
    if (this.options.format === 'text' && fileReport.messages.length > 0) {
      this.logger(`${this.colors[fileReport.averageRank]} ${relative(this.options.cwd, fileReport.fileName)}`);
      let padStart = fileReport.messages[fileReport.messages.length - 1].loc.start.line;
      let padEnd = 0;
      for (const { loc: { start: { column } } } of fileReport.messages) {
        if (column > padEnd) padEnd = column;
      }
      padStart = String(padStart).length;
      padEnd = String(padEnd).length;
      for (const message of fileReport.messages) {
        const {
          maxLabel,
          loc: { start: { line, column } },
          namePath,
          maxRuleId,
          maxRuleValue,
          errorMessage
        } = message;
        const locStart = `${String(line).padStart(padStart)}:${String(column).padEnd(padEnd)}`;
        let text = `  ${this.colors[maxLabel]} ${locStart} ${namePath}`;
        if (this.options.showRules) {
          text += ` (${maxRuleId} = ${maxRuleValue})`;
        }
        this.logger(text);
        if (errorMessage) {
          this.logger(`    ${this.errorColor} ${errorMessage}`);
        }
      }
    }
  }

  finish(report) {
    if (this.options.format === 'json') {
      this.logger(JSON.stringify(report));
    } else if (this.options.format === 'text') {
      if (this.options.average) {
        let avgMsg = `\nAverage rank: ${this.colors[report.averageRank]} (${report.averageRankValue})`;
        for (const label in report.ranksCount) {
          avgMsg += `\n  ${this.colors[label]}: ${report.ranksCount[label]}`;
        }
        this.logger(avgMsg + '\n');
      }
      if (report.errors.maxRank > 0) {
        console.error(`\n${this.errorColor}: maxRank - ${report.errors.maxRank}`);
      }
      if (report.errors.maxAverageRank) {
        console.error(`\n${this.errorColor}: maxAverageRank`);
      }
    }
  }

}


exports.ReportLogger = ReportLogger;
