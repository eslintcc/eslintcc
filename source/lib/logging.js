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

  constructor(complexity, {
    cwd = process.cwd(),
    format = 'text',
    showRules = false,
    logger = console.log
  }) {
    this.complexity = complexity;
    this.options = { cwd, format, showRules };
    this.logger = logger;
    this.colors = this.defaultColors;
    this.complexity.events
      .on('verifyFile', this.verifyFile.bind(this))
      .on('finish', this.finish.bind(this));
  }

  verifyFile(fileReport) {
    if (this.options.format === 'text' && fileReport.messages.length > 0) {
      this.logger(relative(this.options.cwd, fileReport.fileName));
      let padStart = 0;
      let padEnd = 0;
      for (const { loc: { start: { line, column } } } of fileReport.messages) {
        if (line > padStart) padStart = line;
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
          maxRuleValue
        } = message;
        const locStart = `${String(line).padStart(padStart)}:${String(column).padEnd(padEnd)}`;
        let text = `  ${this.colors[maxLabel]} ${locStart} ${namePath}`;
        if (this.options.showRules) {
          text += ` (${maxRuleId} = ${maxRuleValue})`;
        }
        this.logger(text);
      }
    }
  }

  finish(report) {
    if (this.options.format === 'json') {
      this.logger(JSON.stringify(report));
    }
  }

}


exports.ReportLogger = ReportLogger;
