'use strict';

const { patchingESLint, PatchedCLIEngine } = require('./lib/eslint-patches');
const { Ranks } = require('./lib/rank');


// Patching ESLint behavior, for use as a metrics generator
patchingESLint();


class ComplexityReport {

  pushFile(fileName) {
    console.log('pushFile', fileName);
  }

  pushMessage(fileName, ruleId, message) {
    console.log('pushMessage', ruleId, JSON.stringify(message.data));
  }

  finishFile(fileName) {
    console.log('finishFile', fileName);
  }

}


class Complexity {

  get complexityRules() {
    return {
      'complexity': ['error', 0],
      'max-depth': ['error', 0]
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
