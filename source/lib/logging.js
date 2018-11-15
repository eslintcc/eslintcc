'use strict';

const { relative } = require('path');

class ReportLogger {

  constructor(complexity, {
    cwd = process.cwd(),
    format = 'text',
    showRules = false
  }) {
    this.complexity = complexity;
    this.options = { cwd, format, showRules };
    this.complexity.events
      .on('fileFinish', this.fileFinish.bind(this))
      .on('finish', this.finish.bind(this));
  }

  fileFinish(fileReport) {
    if (this.options.format === 'text' && fileReport.messages.length > 0) {
      console.log(relative(this.options.cwd, fileReport.fileName));
      for (let lineIndex = 0; lineIndex < fileReport.messages.length; lineIndex++) {
        const {
          maxLabel,
          loc: { start: { line, column } },
          namePath,
          maxRuleId,
          maxRuleValue
        } = fileReport.messages[lineIndex];
        let text = `  ${maxLabel} ${line}:${column} ${namePath}`;
        if (this.options.showRules) {
          text += ` (${maxRuleId} = ${maxRuleValue})`;
        }
        console.log(text);
      }
    }
  }

  finish(report) {
    if (this.options.format === 'json') {
      console.log(JSON.stringify(report));
    }
  }

}


exports.ReportLogger = ReportLogger;
