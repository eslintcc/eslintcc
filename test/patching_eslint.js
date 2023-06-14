/* eslint-disable prefer-destructuring */
const { equal, deepEqual } = require('assert').strict
const { Test } = require('../build/@nodutilus-test')
const { PatchedESLint } = require('../source/lib/eslint-patches.js')

require('../')


class PatchingESLint extends Test {

  get name() {
    return 'Patching ESlint'
  }

  async ['test: replace message data']() {
    const report = await new PatchedESLint({ overrideConfig: { rules: { complexity: ['error', 0] } } })
      .lintFiles(['./test/src/patching_eslint__message_data.js'])
    const { message } = report[0].messages[0]

    equal('complexity', message.ruleId)
    equal('FunctionDeclaration', message.node.type)
    deepEqual({ complexity: 1, max: 0, name: "Function 'myFunc'" }, message.data)
  }

}

module.exports = PatchingESLint
