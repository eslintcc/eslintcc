/* eslint-disable prefer-destructuring */
const { equal } = require('assert').strict
const { Test } = require('../build/@nodutilus-test')
const { Complexity } = require('../source/complexity')


class TestCodeParts extends Test {

  get name() {
    return 'CodeParts'
  }

  async ['test: anonymous_class']() {
    const { messages } = (await new Complexity()
      .lintFiles(['test/src/code_parts/anonymous_class.mjs']))
      .files[0]
    const [message0, message1, message2] = messages

    equal(message0.name, 'class <anonymous>#\'tfoo\'')
    equal(message1.name, 'class <anonymous>#foo')
    equal(message2.name, 'class <anonymous>.sfoo')
  }

}


module.exports = TestCodeParts
