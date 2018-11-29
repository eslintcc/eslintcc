'use strict';

const { equal, deepEqual } = require('assert').strict;
const { sep, resolve } = require('path');

const { Test } = require('@ndk/test');

const { ReportLogger } = require('../source/lib/logging');
const { Complexity } = require('../');


class TestReportLogger extends Test {

  constructor() {
    super();
    this.filename = `test${sep}src${sep}logging__messages.js`;
    this.step = 0;
    this.messages = {
      0: this.filename,
      1: '  \x1b[32;1mA\x1b[0m  3:0  function myFunc',
      2: '  \x1b[32;1mB\x1b[0m  9:0  function myFunc1',
      3: '  \x1b[33;1mC\x1b[0m 16:0  function myFunc2',
      4: '  \x1b[33;1mD\x1b[0m 23:0  function myFunc3',
      5: '  \x1b[31;1mE\x1b[0m 29:0  function myFunc4',
      6: '  \x1b[31;1mF\x1b[0m 35:0  function myFunc5',
      19: '  \x1b[31;1mF\x1b[0m 53:24 function myFunc6, IfStatement:53-55'
    };
    this.messagesSR = {
      0: this.filename,
      1: '  \x1b[32;1mA\x1b[0m  3:0  function myFunc (complexity = 1)',
      2: '  \x1b[32;1mB\x1b[0m  9:0  function myFunc1 (max-params = 2)',
      3: '  \x1b[33;1mC\x1b[0m 16:0  function myFunc2 (max-params = 3)',
      4: '  \x1b[33;1mD\x1b[0m 23:0  function myFunc3 (max-params = 5)',
      5: '  \x1b[31;1mE\x1b[0m 29:0  function myFunc4 (max-params = 6)',
      6: '  \x1b[31;1mF\x1b[0m 35:0  function myFunc5 (max-params = 7)',
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

  ['test: init']() {
    const complexity = new Complexity({});
    const reportLogger = new ReportLogger(complexity, {});
    equal(process.cwd(), reportLogger.options.cwd);
    equal('text', reportLogger.options.format);
    equal(false, reportLogger.options.showRules);
  }

  ['test: text']() {
    const complexity = new Complexity({});
    new ReportLogger(complexity, {
      logger: msg => this.logger('messages', msg)
    });
    this.step = 0;
    complexity.executeOnFiles(['./test/src/logging__messages.js']);
  }

  ['test: text + showRules']() {
    const complexity = new Complexity({});
    new ReportLogger(complexity, {
      logger: msg => this.logger('messagesSR', msg),
      showRules: true
    });
    this.step = 0;
    complexity.executeOnFiles(['./test/src/logging__messages.js']);
  }

  ['test: json']() {
    const complexity = new Complexity({});
    new ReportLogger(complexity, {
      format: 'json',
      logger: report => {
        report = JSON.parse(report);
        deepEqual({
          files: [{
            'fileName': resolve('test/src/logging__messages_json.js'),
            'messages': [{
              'id': 'function/3:0/5:1',
              'view': 'function',
              'loc': {
                'start': {
                  'line': 3,
                  'column': 0
                },
                'end': {
                  'line': 5,
                  'column': 1
                }
              },
              'namePath': 'function myFunc',
              'complexityRules': {
                'complexity': 1
              },
              'complexityRanks': {
                'complexity-value': 0.2,
                'complexity-label': 'A'
              },
              'maxValue': 0.2,
              'maxLabel': 'A'
            }, {
              'id': 'function/9:0/11:1',
              'view': 'function',
              'loc': {
                'start': {
                  'line': 9,
                  'column': 0
                },
                'end': {
                  'line': 11,
                  'column': 1
                }
              },
              'namePath': 'function myFunc1',
              'complexityRules': {
                'max-params': 2,
                'complexity': 1
              },
              'complexityRanks': {
                'max-params-value': 2,
                'max-params-label': 'B',
                'complexity-value': 0.2,
                'complexity-label': 'A'
              },
              'maxValue': 2,
              'maxLabel': 'B'
            }, {
              'id': 'function/15:0/21:1',
              'view': 'function',
              'loc': {
                'start': {
                  'line': 15,
                  'column': 0
                },
                'end': {
                  'line': 21,
                  'column': 1
                }
              },
              'namePath': 'function myFunc2',
              'complexityRules': {
                'max-params': 2,
                'complexity': 2
              },
              'complexityRanks': {
                'max-params-value': 2,
                'max-params-label': 'B',
                'complexity-value': 0.4,
                'complexity-label': 'A'
              },
              'maxValue': 2,
              'maxLabel': 'B'
            }, {
              'id': 'block/16:2/20:3',
              'view': 'block',
              'loc': {
                'start': {
                  'line': 16,
                  'column': 2
                },
                'end': {
                  'line': 20,
                  'column': 3
                }
              },
              'namePath': 'function myFunc2, IfStatement:16-20',
              'complexityRules': {
                'max-depth': 1
              },
              'complexityRanks': {
                'max-depth-value': 0.5,
                'max-depth-label': 'A'
              },
              'maxValue': 0.5,
              'maxLabel': 'A'
            }, {
              'id': 'function/17:7/19:5',
              'view': 'function',
              'loc': {
                'start': {
                  'line': 17,
                  'column': 7
                },
                'end': {
                  'line': 19,
                  'column': 5
                }
              },
              'namePath': 'function myFunc2, ArrowFunctionExpression:17-19',
              'complexityRules': {
                'max-nested-callbacks': 1,
                'complexity': 1
              },
              'complexityRanks': {
                'max-nested-callbacks-value': 0.333,
                'max-nested-callbacks-label': 'A',
                'complexity-value': 0.2,
                'complexity-label': 'A'
              },
              'maxValue': 0.333,
              'maxLabel': 'A'
            }]
          }]
        }, report);
      }
    });
    complexity.executeOnFiles(['./test/src/logging__messages_json.js']);
  }

}


module.exports = TestReportLogger;
TestReportLogger.runIsMainModule();
