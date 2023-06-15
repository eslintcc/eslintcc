/* eslint-disable prefer-destructuring */
const { equal, deepEqual } = require('assert').strict
const { resolve } = require('path')
const { Test } = require('../build/@nodutilus-test')
const { Complexity } = require('../')
const { nodeSymbol, messagesMapSymbol } = require('../source/lib/report')


class TestComplexity extends Test {

  constructor() {
    super()
    this.rules = {
      all: [
        'complexity', 'max-depth',
        // 'max-len',
        'max-lines', 'max-lines-per-function',
        'max-nested-callbacks', 'max-params', 'max-statements'
      ],
      logic: [
        'complexity', 'max-depth', 'max-nested-callbacks', 'max-params'
      ],
      raw: [
        // 'max-len',
        'max-lines', 'max-lines-per-function', 'max-statements'
      ]
    }
  }

  async ['test: MessageNode #getName']() {
    const complexity = new Complexity()
    const report = await complexity.lintFiles(['test/src/message_node__get_name.js'])
    const { messages } = report.files[0]

    equal('function func1', messages[0][nodeSymbol].getName())
    equal('function func2', messages[1][nodeSymbol].getName())
    equal('function <anonymous> (16:1-16:14)', messages[2][nodeSymbol].getName())
    equal('function func3', messages[3][nodeSymbol].getName())
    equal('arrow function (24:14-36:1)', messages[4][nodeSymbol].getName())
    equal('IfStatement (25:2-27:3)', messages[5][nodeSymbol].getName())
    equal('SwitchStatement (28:2-35:3)', messages[6][nodeSymbol].getName())
    equal('function func5', messages[7][nodeSymbol].getName())
    equal('class myClass1#constructor', messages[8][nodeSymbol].getName())
    equal('class myClass1#myMethod1', messages[9][nodeSymbol].getName())
    equal('class myClass1#myProp1', messages[10][nodeSymbol].getName())
    equal('class myClass1.myMethod1', messages[11][nodeSymbol].getName())
    equal('class myClass1.myProp1', messages[12][nodeSymbol].getName())
    equal("class myClass1.'my method 2'", messages[13][nodeSymbol].getName())
    equal('function myMethod3', messages[14][nodeSymbol].getName())
    equal("function 'my method 3'", messages[15][nodeSymbol].getName())
    equal('function func6', messages[16][nodeSymbol].getName())
    equal('function func6, ForInStatement (70:2-72:3)', messages[17][nodeSymbol].getName())
    equal('function func6, arrow function (74:12-78:3)', messages[18][nodeSymbol].getName())
    equal('function func6IN', messages[20][nodeSymbol].getName())
    equal('function func6IN, IfStatement (83:4-85:5)', messages[21][nodeSymbol].getName())
    equal('arrow function (94:13-98:1)', messages[22][nodeSymbol].getName())
    equal('arrow function (95:3-97:3)', messages[23][nodeSymbol].getName())
    equal('function <anonymous> (103:7-110:1)', messages[24][nodeSymbol].getName())
    equal('function <anonymous> (104:3-104:16)', messages[25][nodeSymbol].getName())
    equal('function <anonymous> (103:7-110:1), IfStatement (105:2-109:3)', messages[26][nodeSymbol].getName())
    equal('function <anonymous> (103:7-110:1), IfStatement (106:4-108:5)', messages[27][nodeSymbol].getName())
    equal('function myMethod5', messages[28][nodeSymbol].getName())
    equal('function myFunc4', messages[29][nodeSymbol].getName())
    equal('function myFunc5', messages[30][nodeSymbol].getName())
    equal('function myFunc7', messages[31][nodeSymbol].getName())
    equal(undefined, messages[32])
  }

  ['test: #getComplexityRules']() {
    const complexity = new Complexity()

    deepEqual(this.rules.logic, Object.keys(complexity.getComplexityRules()))
    deepEqual(complexity.getComplexityRules('logic'), complexity.getComplexityRules())
    deepEqual(complexity.getComplexityRules('error'), complexity.getComplexityRules('logic'))
    deepEqual(this.rules.all, Object.keys(complexity.getComplexityRules('all')))
    deepEqual(this.rules.raw, Object.keys(complexity.getComplexityRules('raw')))
    deepEqual(['complexity'], Object.keys(complexity.getComplexityRules('complexity')))
  }

  async ['test: #lintFiles']() {
    const complexity = new Complexity()
    const report = await complexity.lintFiles(['test/src/complexity__messages.js'])

    equal('function myFunc', report.files[0].messages[0].name)
    deepEqual({
      complexity: { value: 1, rank: 0.2, label: 'A' }
    }, report.files[0].messages[0].rules)

    equal('function myFunc1', report.files[0].messages[1].name)
    deepEqual({
      'max-params': { value: 2, rank: 2, label: 'B' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, report.files[0].messages[1].rules)

    equal('function myFunc2', report.files[0].messages[2].name)
    deepEqual({
      'max-params': { value: 3, rank: 3, label: 'C' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, report.files[0].messages[2].rules)

    equal('function myFunc3', report.files[0].messages[3].name)
    deepEqual({
      'max-params': { value: 4, rank: 3.5, label: 'D' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, report.files[0].messages[3].rules)

    equal('function myFunc7, IfStatement (46:2-70:3)', report.files[0].messages[8].name)
    deepEqual({
      'max-depth': { value: 1, rank: 0.5, label: 'A' }
    }, report.files[0].messages[8].rules)

    equal('function myFunc7, IfStatement (57:24-59:25)', report.files[0].messages[19].name)
    deepEqual({
      'max-depth': { value: 12, rank: 5.5, label: 'F' }
    }, report.files[0].messages[19].rules)

    equal('function myFunc8, arrow function (76:5-78:3)', report.files[0].messages[21].name)
    deepEqual({
      'complexity': { value: 1, rank: 0.2, label: 'A' },
      'max-nested-callbacks': { value: 1, rank: 0.333, label: 'A' }
    }, report.files[0].messages[21].rules)
  }

  async ['test: #lintFiles (complexity)']() {
    const file = 'test/src/complexity__one_rule.js'
    const complexity = new Complexity()
    const report = (await complexity.lintFiles([file])).files[0].messages[0]

    equal('max-params', report.maxRule)
    deepEqual({
      'max-params': { value: 7, rank: 5.166, label: 'F' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, report.rules)

    const onlyComplexity = new Complexity({ rules: 'complexity' })
    const onlyCReport = (await onlyComplexity.lintFiles([file])).files[0].messages[0]

    equal('complexity', onlyCReport.maxRule)
    deepEqual({
      complexity: { value: 1, rank: 0.2, label: 'A' }
    }, onlyCReport.rules)
  }

  async ['test: #lintFiles (raw rules)']() {
    const file = 'test/src/complexity__raw_rules.js'
    const complexity = new Complexity()
    const report = (await complexity.lintFiles([file])).files[0].messages[0]

    equal('max-params', report.maxRule)
    deepEqual({
      'max-params': { value: 7, rank: 5.166, label: 'F' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, report.rules)

    const rawComplexity = new Complexity({ rules: 'raw' })
    const rawReport = (await rawComplexity.lintFiles([file])).files[0].messages

    equal('max-lines', rawReport[0].maxRule)
    deepEqual({
      'max-lines': { value: 12, rank: 0.16, label: 'A' }
    }, rawReport[0].rules)
    equal('max-statements', rawReport[1].maxRule)
    deepEqual({
      'max-lines-per-function': { value: 8, rank: 0.615, label: 'A' },
      'max-statements': { value: 4, rank: 1.5, label: 'B' }
    }, rawReport[1].rules)
  }

  async ['test: #lintFiles (parse Error: Fatal)']() {
    const file = 'test/src/complexity__fatal.js'
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
    const report = (await complexity.lintFiles([file])).files[0].messages[0]

    deepEqual({
      'fatal-error': { value: 1, rank: 6, label: 'F' }
    }, report.rules)
    equal('2:3-2:3', report[nodeSymbol].position)
    equal('fatal-error', report.maxRule)
    equal('F', report.rules[report.maxRule].label)
    equal(1, report.rules[report.maxRule].value)
    equal(6, report.rules[report.maxRule].rank)
    equal("Parsing error: The keyword 'const' is reserved", report.error)
    equal('Program (2:3-2:3)', report.name)
    equal('file', report.type)
  }

  async ['test: #lintFiles (parse Error: Fatal, JSON)']() {
    const file = 'test/src/complexity__fatal.js'
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
    const report = JSON.stringify((await complexity.lintFiles([file])).files[0].messages[0])

    deepEqual({
      type: 'file',
      loc: { start: { line: 2, column: 3 }, end: { line: 2, column: 3 } },
      name: 'Program (2:3-2:3)',
      rules: { 'fatal-error': { value: 1, rank: 6, label: 'F' } },
      maxRule: 'fatal-error',
      error: "Parsing error: The keyword 'const' is reserved"
    }, JSON.parse(report))
  }

  async ['test: #toJSON']() {
    const complexity = new Complexity()
    const report = await complexity.lintFiles(['test/src/complexity__messages_json.js'])

    deepEqual({
      average: { rank: 0.2, label: 'A' },
      errors: {
        maxAverageRank: false,
        maxRank: 0
      },
      ranks: {
        A: 1,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0
      },
      files: [{
        average: { rank: 0.2, label: 'A' },
        file: resolve('test/src/complexity__messages_json.js'),
        messages: [{
          type: 'function',
          loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
          name: 'function myFunc',
          rules: { complexity: { value: 1, rank: 0.2, label: 'A' } },
          maxRule: 'complexity'
        }]
      }]
    }, JSON.parse(JSON.stringify(report)))
  }

  async ['test: ~greaterThan']() {
    const complexity = new Complexity()
    const { messages } = (await complexity.lintFiles(['test/src/complexity__messages_gtlt.js'])).files[0]

    equal('A', messages[0].rules[messages[0].maxRule].label)
    equal('B', messages[1].rules[messages[1].maxRule].label)
    equal('C', messages[2].rules[messages[2].maxRule].label)
    equal('F', messages[3].rules[messages[3].maxRule].label)
    equal('F', messages[4].rules[messages[4].maxRule].label)

    const complexityB = new Complexity({ greaterThan: 'B' })
    const fileB = (await complexityB.lintFiles(['test/src/complexity__messages_gtlt.js'])).files[0]
    const messagesB = fileB.messages

    equal('C', messagesB[0].rules[messagesB[0].maxRule].label)
    equal('F', messagesB[1].rules[messagesB[1].maxRule].label)
    equal('F', messagesB[2].rules[messagesB[2].maxRule].label)
    equal(undefined, messagesB[3])
    equal(messagesB.length, fileB[messagesMapSymbol].size)

    const complexityE = new Complexity({ greaterThan: 'E' })
    const fileE = (await complexityE.lintFiles(['test/src/complexity__messages_gtlt.js'])).files[0]
    const messagesE = fileE.messages

    equal('F', messagesE[0].rules[messagesE[0].maxRule].label)
    equal('F', messagesE[1].rules[messagesE[1].maxRule].label)
    equal(undefined, messagesE[2])
    equal(messagesE.length, fileE[messagesMapSymbol].size)

    const complexityN = new Complexity({ greaterThan: 6 })
    const fileN = (await complexityN.lintFiles(['test/src/complexity__messages_gtlt.js'])).files[0]
    const messagesN = fileN.messages

    equal('F', messagesN[0].rules[messagesN[0].maxRule].label)
    equal(undefined, messagesN[1])
    equal(messagesN.length, fileN[messagesMapSymbol].size)
  }

  async ['test: ~lessThan']() {
    const complexityB = new Complexity({ lessThan: 'B' })
    const messagesB = (await complexityB.lintFiles(['test/src/complexity__messages_gtlt.js'])).files[0].messages

    equal('A', messagesB[0].rules[messagesB[0].maxRule].label)
    equal(undefined, messagesB[1])

    const complexityE = new Complexity({ lessThan: 'E' })
    const messagesE = (await complexityE.lintFiles(['test/src/complexity__messages_gtlt.js'])).files[0].messages

    equal('A', messagesE[0].rules[messagesE[0].maxRule].label)
    equal('B', messagesE[1].rules[messagesE[1].maxRule].label)
    equal('C', messagesE[2].rules[messagesE[2].maxRule].label)
    equal(undefined, messagesE[3])

    const complexityN = new Complexity({ lessThan: 0.5 })
    const messagesN = (await complexityN.lintFiles(['test/src/complexity__messages_gtlt.js'])).files[0].messages

    equal('A', messagesN[0].rules[messagesN[0].maxRule].label)
    equal(undefined, messagesN[1])
  }

  async ['test: ~name']() {
    const { messages } = (await new Complexity()
      .lintFiles(['test/src/complexity__messages_node_name.js']))
      .files[0]

    equal('function myFunc1', messages[0].name)
    equal('function myFunc2', messages[1].name)
    equal('function <anonymous> (14:1-14:14)', messages[2].name)
    equal('function <anonymous> (17:7-21:1)', messages[3].name)
    equal('function myFunc3', messages[4].name)
    equal('class myClass1#constructor', messages[5].name)
    equal('class myClass1#myMethod1', messages[6].name)
    equal('class myClass1#myProp1', messages[7].name)
    equal('class myClass1.myMethod1', messages[8].name)
    equal('class myClass1.myProp1', messages[9].name)
    equal('class myClass1.\'my method 2\'', messages[10].name)
    equal('function \'my method 3\'', messages[11].name)
    equal('arrow function (45:13-49:1)', messages[12].name)
    equal('arrow function (46:3-48:3)', messages[13].name)
    equal('function <anonymous> (54:7-61:1)', messages[14].name)
    equal('function <anonymous> (55:3-55:16)', messages[15].name)
    equal('function <anonymous> (54:7-61:1), IfStatement (56:2-60:3)', messages[16].name)
    equal('function <anonymous> (54:7-61:1), IfStatement (57:4-59:5)', messages[17].name)
    equal('function myMethod5', messages[18].name)
    equal('function myFunc4', messages[19].name)
    equal('function myFunc5', messages[20].name)
    equal('function myFunc7', messages[21].name)
  }

  async ['test: ~noInlineConfig']() {
    const messages1 = (await new Complexity()
      .lintFiles(['test/src/complexity__inline_config_for_file.js']))
      .files[0].messages

    equal(0, messages1.length)

    const messages2 = (await new Complexity({ noInlineConfig: true })
      .lintFiles(['test/src/complexity__inline_config_for_file.js']))
      .files[0].messages

    equal(1, messages2.length)

    const messages3 = (await new Complexity()
      .lintFiles(['test/src/complexity__inline_config.js']))
      .files[0].messages

    equal(2, messages3.length)
    deepEqual({
      complexity: { value: 1, rank: 0.2, label: 'A' }
    }, messages3[0].rules)
    deepEqual({
      'max-params': { value: 13, rank: 6.166, label: 'F' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, messages3[1].rules)

    const messages4 = (await new Complexity({ noInlineConfig: true })
      .lintFiles(['test/src/complexity__inline_config.js']))
      .files[0].messages

    equal(4, messages4.length)
  }

  async ['test: ~average']() {
    const report = await new Complexity().lintFiles(['test/src/complexity__average_rank'])

    equal(3.416, report.average.rank)
    equal('D', report.average.label)
  }

  async ['test: ~maxRank']() {
    const file = 'test/src/complexity__max_rank.js'
    const complexity = new Complexity()
    const report = await complexity.lintFiles([file])
    const message = report.files[0].messages[6]

    deepEqual({ maxAverageRank: false, maxRank: 1 }, report.errors)
    equal(0.333, message.rules[message.maxRule].rank)
    equal(1.333, report.average.rank)
    equal('B', report.average.label)
  }

  async ['test: ~maxRank + ~greaterThan']() {
    const file = 'test/src/complexity__max_rank.js'
    const complexity = new Complexity({ greaterThan: 'E' })
    const report = await complexity.lintFiles([file])

    equal(0, report.files[0].messages.length)
    deepEqual({ maxAverageRank: false, maxRank: 1 }, report.errors)
  }

  async ['test: ~maxRank + ~maxAverageRank + ~greaterThan (3.5)']() {
    const file = 'test/src/complexity__max_average_rank_3_5.js'
    const complexity = new Complexity({
      greaterThan: 'E',
      maxRank: 3.5,
      maxAverageRank: 3.5
    })
    const report = await complexity.lintFiles([file])

    equal(3, report.files[0].messages.length)
    deepEqual({ maxAverageRank: false, maxRank: 6 }, report.errors)
  }

  async ['test: ~maxAverageRank']() {
    const file = 'test/src/complexity__max_average_rank.js'
    const complexity = new Complexity()
    const report = await complexity.lintFiles([file])

    deepEqual({ maxAverageRank: true, maxRank: 0 }, report.errors)
  }

  async ['test: ~maxRank + ~maxAverageRank (parse Error: Fatal)']() {
    const file = 'test/src/complexity__fatal.js'
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
    const report = await complexity.lintFiles([file])

    equal(1, report.files[0].messages.length)
    deepEqual({ maxAverageRank: true, maxRank: 1 }, report.errors)
  }

  async ['test: ~maxRank + ~maxAverageRank + ~greaterThan F (parse Error: Fatal)']() {
    const file = 'test/src/complexity__fatal.js'
    const complexity = new Complexity({
      greaterThan: 'F',
      maxRank: 'F',
      maxAverageRank: 'F',
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
    const report = await complexity.lintFiles([file])

    equal(1, report.files[0].messages.length)
    deepEqual({ maxAverageRank: false, maxRank: 1 }, report.errors)
  }

  async ['test: *case: file-in-script-style']() {
    const file = 'test/src/complexity__script.js'
    const complexity = new Complexity({ rules: 'all' })
    const report = (await complexity.lintFiles([file])).files[0].messages

    deepEqual([{
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      maxRule: 'max-lines',
      name: 'Program (1:0-1:0)',
      rules: {
        'max-lines': { label: 'A', rank: 0.08, value: 6 }
      },
      type: 'file'
    }], JSON.parse(JSON.stringify(report)))
  }

}


module.exports = TestComplexity
