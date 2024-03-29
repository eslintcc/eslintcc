/* eslint-disable no-new */
const { equal, deepEqual } = require('assert').strict
const { sep, resolve } = require('path')
const { Test } = require('../build/@nodutilus-test')
const { ReportLogger } = require('../source/lib/logging')
const { Complexity } = require('../')

const logger = Symbol('logger')
const errLogger = Symbol('errLogger')

class TestReportLogger extends Test {

  constructor() {
    super()
    this.step = 0
    this.errStep = 0
    this.messages = {
      0: `\x1b[33;1mD\x1b[0m test${sep}src${sep}logging__messages.js`,
      1: '  \x1b[32;1mA\x1b[0m  3:0  function myFunc',
      2: '  \x1b[32;1mB\x1b[0m  9:0  function myFunc1',
      3: '  \x1b[33;1mC\x1b[0m 16:0  function myFunc2',
      4: '  \x1b[33;1mD\x1b[0m 23:0  function myFunc3',
      5: '  \x1b[31;1mE\x1b[0m 29:0  function myFunc4',
      6: '  \x1b[31;1mF\x1b[0m 35:0  function myFunc5',
      19: '  \x1b[31;1mF\x1b[0m 53:24 function myFunc6, IfStatement (53:24-55:25)'
    }
    this.errMessages = {
      0: '\u001b[31;1mError\u001b[0m: Complexity of code above maximum allowable rank \u001b[33;1mC\u001b[0m (3), messages - 11',
      1: '\u001b[31;1mError\u001b[0m: Average complexity of code above maximum allowable average rank \u001b[32;1mB\u001b[0m (2)'
    }
    this.messagesAVG = {
      0: `\u001b[33;1mD\u001b[0m test${sep}src${sep}complexity__average_rank${sep}avg1.js`,
      1: '  \u001b[32;1mB\u001b[0m  3:0 function myFunc1',
      2: '  \u001b[31;1mF\u001b[0m 11:0 function myFunc2',
      3: `\u001b[33;1mD\u001b[0m test${sep}src${sep}complexity__average_rank${sep}avg2.js`,
      4: '  \u001b[33;1mC\u001b[0m  3:0 function myFunc1',
      5: '  \u001b[33;1mD\u001b[0m 11:0 function myFunc2',
      6: '\nAverage rank: \u001b[33;1mD\u001b[0m (3.416)\n' +
        '  \u001b[32;1mA\u001b[0m: 0\n' +
        '  \u001b[32;1mB\u001b[0m: 1\n' +
        '  \u001b[33;1mC\u001b[0m: 1\n' +
        '  \u001b[33;1mD\u001b[0m: 1\n' +
        '  \u001b[31;1mE\u001b[0m: 0\n' +
        '  \u001b[31;1mF\u001b[0m: 1\n'
    }
    this.errMessagesAVG = {
      0: '\u001b[31;1mError\u001b[0m: Complexity of code above maximum allowable rank \u001b[33;1mC\u001b[0m (3), messages - 2',
      1: '\u001b[31;1mError\u001b[0m: Average complexity of code above maximum allowable average rank \u001b[32;1mB\u001b[0m (2)'
    }
    this.messagesMR = {
      0: `\u001b[32;1mB\u001b[0m test${sep}src${sep}complexity__max_rank.js`,
      1: '  \u001b[33;1mD\u001b[0m  3:0 function MyFunc',
      2: '  \u001b[32;1mA\u001b[0m  9:0 function MyFunc1',
      3: '  \u001b[32;1mA\u001b[0m 15:0 function MyFunc2',
      4: '  \u001b[32;1mA\u001b[0m 21:0 function MyFunc3',
      5: '  \u001b[32;1mB\u001b[0m 27:0 function myFunc4',
      6: '  \u001b[32;1mA\u001b[0m 28:2 function myFunc4, IfStatement (28:2-32:3)',
      7: '  \u001b[32;1mA\u001b[0m 29:7 function myFunc4, arrow function (29:7-31:5)'
    }
    this.errMessagesMR = {
      0: '\u001b[31;1mError\u001b[0m: Complexity of code above maximum allowable rank \u001b[33;1mC\u001b[0m (3), messages - 1'
    }
    this.messagesMAR = {
      0: `\u001b[33;1mC\u001b[0m test${sep}src${sep}complexity__max_average_rank.js`,
      1: '  \u001b[33;1mC\u001b[0m 3:0 function MyFunc'
    }
    this.errMessagesMAR = {
      1: '\u001b[31;1mError\u001b[0m: Average complexity of code above maximum allowable average rank \u001b[32;1mB\u001b[0m (2)'
    }
    this.messagesSR = {
      0: `\x1b[33;1mD\x1b[0m test${sep}src${sep}logging__messages.js`,
      1: '  \x1b[32;1mA\x1b[0m  3:0  function myFunc (complexity = 1)',
      2: '  \x1b[32;1mB\x1b[0m  9:0  function myFunc1 (max-params = 2)',
      3: '  \x1b[33;1mC\x1b[0m 16:0  function myFunc2 (max-params = 3)',
      4: '  \x1b[33;1mD\x1b[0m 23:0  function myFunc3 (max-params = 5)',
      5: '  \x1b[31;1mE\x1b[0m 29:0  function myFunc4 (max-params = 6)',
      6: '  \x1b[31;1mF\x1b[0m 35:0  function myFunc5 (max-params = 7)',
      7: '  \x1b[33;1mC\x1b[0m 41:0  function myFunc6 (complexity = 13)',
      19: '  \x1b[31;1mF\x1b[0m 53:24 function myFunc6, IfStatement (53:24-55:25) (max-depth = 12)'
    }
    this.errMessagesSR = {
      0: '\u001b[31;1mError\u001b[0m: Complexity of code above maximum allowable rank \u001b[33;1mC\u001b[0m (3), messages - 11',
      1: '\u001b[31;1mError\u001b[0m: Average complexity of code above maximum allowable average rank \u001b[32;1mB\u001b[0m (2)'
    }
    this.messagesFatal = {
      0: `\x1b[31;1mF\x1b[0m test${sep}src${sep}complexity__fatal.js`,
      1: '  \x1b[31;1mF\x1b[0m 2:3 Program (2:3-2:3) (fatal-error = 1)',
      2: "    \x1b[31;1mError\x1b[0m Parsing error: The keyword 'const' is reserved"
    }
    this.errMessagesFatal = {
      0: '\u001b[31;1mError\u001b[0m: Complexity of code above maximum allowable rank \u001b[33;1mC\u001b[0m (3), messages - 1',
      1: '\u001b[31;1mError\u001b[0m: Average complexity of code above maximum allowable average rank \u001b[32;1mB\u001b[0m (2)'
    }
  }


  [logger](msgData, message) {
    if (this.step in this[msgData]) {
      equal(this[msgData][this.step], message)
    }
    this.step++
  }

  [errLogger](msgData, message) {
    if (this.errStep in this[msgData]) {
      equal(this[msgData][this.errStep], message)
    }
    this.errStep++
  }

  ['test: init']() {
    const complexity = new Complexity({})
    const reportLogger = new ReportLogger(complexity, {})

    equal(process.cwd(), reportLogger.options.cwd)
    equal('text', reportLogger.options.format)
    equal(false, reportLogger.options.showRules)
  }

  async ['test: text']() {
    const complexity = new Complexity({})

    new ReportLogger(complexity, {
      logger: msg => this[logger]('messages', msg),
      errLogger: msg => this[errLogger]('errMessages', msg)
    })
    this.step = 0
    this.errStep = 0
    await complexity.lintFiles(['./test/src/logging__messages.js'])
    equal(20, this.step)
    equal(2, this.errStep)
  }

  async ['test: text + average']() {
    const complexity = new Complexity()

    new ReportLogger(complexity, {
      logger: msg => this[logger]('messagesAVG', msg),
      errLogger: msg => this[errLogger]('errMessagesAVG', msg),
      average: true
    })
    this.step = 0
    this.errStep = 0
    await complexity.lintFiles(['./test/src/complexity__average_rank'])
    equal(7, this.step)
    equal(2, this.errStep)
  }

  async ['test: text + max-rank']() {
    const complexity = new Complexity()

    new ReportLogger(complexity, {
      logger: msg => this[logger]('messagesMR', msg),
      errLogger: msg => this[errLogger]('errMessagesMR', msg)
    })
    this.step = 0
    this.errStep = 0
    await complexity.lintFiles(['./test/src/complexity__max_rank.js'])
    equal(8, this.step)
    equal(1, this.errStep)
  }

  async ['test: text + max-average-rank']() {
    const complexity = new Complexity()

    new ReportLogger(complexity, {
      logger: msg => this[logger]('messagesMAR', msg),
      errLogger: msg => this[errLogger]('errMessagesMAR', msg)
    })
    this.step = 0
    this.errStep = 0
    await complexity.lintFiles(['./test/src/complexity__max_average_rank.js'])
    equal(2, this.step)
    equal(1, this.errStep)
  }

  async ['test: text + showRules']() {
    const complexity = new Complexity({})

    new ReportLogger(complexity, {
      logger: msg => this[logger]('messagesSR', msg),
      errLogger: msg => this[errLogger]('errMessagesSR', msg),
      showRules: true
    })
    this.step = 0
    this.errStep = 0
    await complexity.lintFiles(['./test/src/logging__messages.js'])
    equal(20, this.step)
    equal(2, this.errStep)
  }

  async ['test: text + messagesFatal']() {
    const complexity = new Complexity({
      eslintOptions: {
        useEslintrc: false,
        overrideConfig: {
          parserOptions: {
            ecmaVersion: 5,
            sourceType: 'script'
          }
        }
      }
    })

    new ReportLogger(complexity, {
      logger: msg => this[logger]('messagesFatal', msg),
      errLogger: msg => this[errLogger]('errMessagesFatal', msg),
      showRules: true
    })
    this.step = 0
    this.errStep = 0
    await complexity.lintFiles(['./test/src/complexity__fatal.js'])
    equal(3, this.step)
    equal(2, this.errStep)
  }

  async ['test: json']() {
    const complexity = new Complexity({})

    new ReportLogger(complexity, {
      format: 'json',
      logger: report => {
        report = JSON.parse(report)
        deepEqual({
          average: { rank: 1.006, label: 'B' },
          errors: {
            maxAverageRank: false,
            maxRank: 0
          },
          ranks: {
            A: 3,
            B: 2,
            C: 0,
            D: 0,
            E: 0,
            F: 0
          },
          files: [{
            average: { rank: 1.006, label: 'B' },
            file: resolve('test/src/logging__messages_json.js'),
            messages: [{
              type: 'function',
              loc: {
                start: {
                  line: 3,
                  column: 0
                },
                end: {
                  line: 5,
                  column: 1
                }
              },
              name: 'function myFunc',
              rules: {
                complexity: { value: 1, rank: 0.2, label: 'A' }
              },
              maxRule: 'complexity'
            }, {
              type: 'function',
              loc: {
                start: {
                  line: 9,
                  column: 0
                },
                end: {
                  line: 11,
                  column: 1
                }
              },
              name: 'function myFunc1',
              rules: {
                'max-params': { value: 2, rank: 2, label: 'B' },
                'complexity': { value: 1, rank: 0.2, label: 'A' }
              },
              maxRule: 'max-params'
            }, {
              type: 'function',
              loc: {
                start: {
                  line: 15,
                  column: 0
                },
                end: {
                  line: 21,
                  column: 1
                }
              },
              name: 'function myFunc2',
              rules: {
                'max-params': { value: 2, rank: 2, label: 'B' },
                'complexity': { value: 2, rank: 0.4, label: 'A' }
              },
              maxRule: 'max-params'
            }, {
              type: 'block',
              loc: {
                start: {
                  line: 16,
                  column: 2
                },
                end: {
                  line: 20,
                  column: 3
                }
              },
              name: 'function myFunc2, IfStatement (16:2-20:3)',
              rules: {
                'max-depth': { value: 1, rank: 0.5, label: 'A' }
              },
              maxRule: 'max-depth'
            }, {
              type: 'function',
              loc: {
                start: {
                  line: 17,
                  column: 7
                },
                end: {
                  line: 19,
                  column: 5
                }
              },
              name: 'function myFunc2, arrow function (17:7-19:5)',
              rules: {
                'max-nested-callbacks': { value: 1, rank: 0.333, label: 'A' },
                'complexity': { value: 1, rank: 0.2, label: 'A' }
              },
              maxRule: 'max-nested-callbacks'
            }]
          }]
        }, report)
      }
    })
    await complexity.lintFiles(['./test/src/logging__messages_json.js'])
  }

}


module.exports = TestReportLogger
