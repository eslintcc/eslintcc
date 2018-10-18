'use strict';

const { relative } = require('path');

class ReportLogger {

  constructor(report) {
    this.report = report;
  }

  log() {
    const cwd = process.cwd();
    for (const { filePath, messages } of this.report.results) {
      if (messages.length > 0) {
        console.log(relative(cwd, filePath));
        for (const { line, column, ruleMessage } of messages) {
          console.log(`${line}:${column}`, ruleMessage);
        }
      }
    }
  }

}


exports.ReportLogger = ReportLogger;
