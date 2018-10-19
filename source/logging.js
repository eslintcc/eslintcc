'use strict';

const { relative } = require('path');

class ReportLogger {

  constructor(report) {
    this.report = report;
  }

  getFileLineByIndex(fileIndex) {
    const file = this.report.results[fileIndex];
    const text = relative(this.report.cwd, file.filePath);
    return text;
  }

  getLineByIndex(fileIndex, lineIndex) {
    const { rank, line, column, ruleMessage } = this.report.results[fileIndex].messages[lineIndex];
    const text = `  ${rank} ${line}:${column} ${ruleMessage}`;
    return text;
  }

  log() {
    const results = this.report.results;
    for (let fileIndex = 0; fileIndex < results.length; fileIndex++) {
      const messages = results[fileIndex].messages;
      if (messages.length > 0) {
        console.log(this.getFileLineByIndex(fileIndex));
        for (let lineIndex = 0; lineIndex < messages.length; lineIndex++) {
          console.log(this.getLineByIndex(fileIndex, lineIndex));
        }
      }
    }
  }

}


exports.ReportLogger = ReportLogger;
