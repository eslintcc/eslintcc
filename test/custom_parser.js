'use strict';

const { equal, deepEqual } = require('assert').strict;
const { Test } = require('../build/@nodutilus-test');
const { Complexity } = require('../source/complexity');


class CustomParsers extends Test {

  get name() {
    return 'CustomParsers';
  }

  ['test: @babel/eslint-parser']() {
    const messages = new Complexity()
      .executeOnFiles(['./test/src/custom_parser/babel-eslint-parser.mjs'])
      .files[0].messages;

    equal(2, messages.length);
    deepEqual({ complexity: { value: 1, rank: 0.2, label: 'A' } }, messages[0].rules);
    deepEqual(messages[0].rules, messages[1].rules);
  }

  ['test: @typescript-eslint/parser']() {
    const messages = new Complexity()
      .executeOnFiles(['./test/src/custom_parser/typescript-eslint-parser.ts'])
      .files[0].messages;

    deepEqual({
      'max-params': { value: 1, rank: 1, label: 'A' },
      'complexity': { value: 2, rank: 0.4, label: 'A' }
    }, messages[0].rules);
    deepEqual({
      'max-depth': { value: 1, rank: 0.5, label: 'A' }
    }, messages[1].rules);
  }

}


module.exports = CustomParsers;
