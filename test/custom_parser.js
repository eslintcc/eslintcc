/* eslint-disable prefer-destructuring */
const { equal, deepEqual } = require('assert').strict
const { Test } = require('../build/@nodutilus-test')
const { Complexity } = require('../source/complexity')


class CustomParsers extends Test {

  get name() {
    return 'CustomParsers'
  }

  async ['test: @babel/eslint-parser']() {
    const { messages } = (await new Complexity()
      .lintFiles(['./test/src/custom_parser/babel-eslint-parser.mjs']))
      .files[0]

    equal(3, messages.length)
    deepEqual({ complexity: { value: 1, rank: 0.2, label: 'A' } }, messages[0].rules)
    deepEqual(messages[0].rules, messages[1].rules)
    deepEqual(messages[0].rules, messages[1].rules)
    deepEqual(messages[1].rules, messages[2].rules)
    deepEqual({
      start: { line: 9, column: 7 },
      end: { line: 11, column: 3 }
    }, JSON.parse(JSON.stringify(messages[2].loc)))
  }

  async ['test: @typescript-eslint/parser']() {
    const result = await new Complexity({
      eslintOptions: { ignore: false }
    }).lintFiles(['./test/src/custom_parser/typescript-eslint-parser.ts'])
    const { messages } = result.files[0]

    deepEqual({
      'max-params': { value: 1, rank: 1, label: 'A' },
      'complexity': { value: 2, rank: 0.4, label: 'A' }
    }, messages[0].rules)
    deepEqual({
      'max-depth': { value: 1, rank: 0.5, label: 'A' }
    }, messages[1].rules)
  }

  async ['test: @typescript-eslint/parser with eslintOptions']() {
    const report = await new Complexity({
      rules: 'logic',
      eslintOptions: {
        useEslintrc: false,
        overrideConfig: {
          parser: '@typescript-eslint/parser',
          plugins: ['@typescript-eslint'],
          extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended']
        }
      }
    })
      .lintFiles(['./test/src/custom_parser/typescript-eslint-parser__eslint-options.ts'])
    const { messages } = report.files[0]

    deepEqual({
      'max-params': { value: 1, rank: 1, label: 'A' },
      'complexity': { value: 2, rank: 0.4, label: 'A' }
    }, messages[0].rules)
    deepEqual({
      'max-depth': { value: 1, rank: 0.5, label: 'A' }
    }, messages[1].rules)
  }

  async ['test: @typescript-eslint/parser with eslintOptions+rules']() {
    const report = await new Complexity({
      rules: 'logic',
      eslintOptions: {
        useEslintrc: false,
        overrideConfig: {
          parser: '@typescript-eslint/parser',
          plugins: ['@typescript-eslint'],
          extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
          rules: { 'no-console': ['error'] }
        }
      }
    })
      .lintFiles(['./test/src/custom_parser/typescript-eslint-parser__eslint-options.ts'])
    const { messages } = report.files[0]

    deepEqual({
      'max-params': { value: 1, rank: 1, label: 'A' },
      'complexity': { value: 2, rank: 0.4, label: 'A' }
    }, messages[0].rules)
    deepEqual({
      'max-depth': { value: 1, rank: 0.5, label: 'A' }
    }, messages[1].rules)
  }

}


module.exports = CustomParsers
