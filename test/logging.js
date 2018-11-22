'use strict';

const { equal } = require('assert').strict;

const { Test } = require('@ndk/test');

const { ReportLogger } = require('../source/lib/logging');
const { Complexity } = require('../');


class TestReportLogger extends Test {

  constructor() {
    super();
    this.step = 0;
    this.messages = {
      0: 'test/src/logging__messages.js',
      1: '  \x1b[32;1mA\x1b[0m  3:0  function myFunc',
      2: '  \x1b[32;1mB\x1b[0m  9:0  function myFunc1',
      3: '  \x1b[33;1mC\x1b[0m 16:0  function myFunc2',
      4: '  \x1b[33;1mD\x1b[0m 23:0  function myFunc3',
      5: '  \x1b[31;1mE\x1b[0m 29:0  function myFunc4',
      6: '  \x1b[31;1mF\x1b[0m 35:0  function myFunc5',
      19: '  \x1b[31;1mF\x1b[0m 53:24 function myFunc6, IfStatement:53-55'
    };
    this.messagesSR = {
      0: 'test/src/logging__messages.js',
      1: '  \x1b[32;1mA\x1b[0m  3:0  function myFunc (complexity = 1)',
      2: '  \x1b[32;1mB\x1b[0m  9:0  function myFunc1 (max-params = 2)',
      3: '  \x1b[33;1mC\x1b[0m 16:0  function myFunc2 (max-params = 3)',
      4: '  \x1b[33;1mD\x1b[0m 23:0  function myFunc3 (max-params = 4)',
      5: '  \x1b[31;1mE\x1b[0m 29:0  function myFunc4 (max-params = 5)',
      6: '  \x1b[31;1mF\x1b[0m 35:0  function myFunc5 (max-params = 6)',
      7: '  \x1b[33;1mC\x1b[0m 41:0  function myFunc6 (complexity = 13)',
      19: '  \x1b[31;1mF\x1b[0m 53:24 function myFunc6, IfStatement:53-55 (max-depth = 12)'
    };
  }

  get name() {
    return 'ReportLogger';
  }

  logger(msgData, message) {
    if (this.step in this[msgData]) {
      equal(this[msgData][this.step], message);
    }
    this.step++;
  }

  ['test: ReportLogger init']() {
    const complexity = new Complexity({});
    const reportLogger = new ReportLogger(complexity, {});
    equal(process.cwd(), reportLogger.options.cwd);
    equal('text', reportLogger.options.format);
    equal(false, reportLogger.options.showRules);
  }

  ['test: ReportLogger text']() {
    const complexity = new Complexity({});
    new ReportLogger(complexity, {
      logger: msg => this.logger('messages', msg)
    });
    this.step = 0;
    complexity.executeOnFiles(['./test/src/logging__messages.js']);
  }

  ['test: ReportLogger text + showRules']() {
    const complexity = new Complexity({});
    new ReportLogger(complexity, {
      logger: msg => this.logger('messagesSR', msg),
      showRules: true
    });
    this.step = 0;
    complexity.executeOnFiles(['./test/src/logging__messages.js']);
  }

}


module.exports = TestReportLogger;
TestReportLogger.runIsMainModule();
