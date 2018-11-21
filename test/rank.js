'use strict';

const { equal, deepEqual } = require('assert').strict;

const { Test } = require('@ndk/test');

const { Ranks } = require('../source/lib/rank');


class TestRank extends Test {

  get name() {
    return 'Ranks';
  }

  ['test: Ranks~customRulesRanks']() {
    const customRulesRanks = { A: 11, B: 22, C: 33, D: 44, E: 55, F: Infinity, G: 100 };
    const ranks = new Ranks({ 'complexity': customRulesRanks, 'complexity_': customRulesRanks });
    deepEqual({ A: 11, B: 22, C: 33, D: 44, E: 55, F: Infinity }, ranks.ranks.complexity);
    equal(undefined, ranks.ranks.complexity_);
  }

}


module.exports = TestRank;
TestRank.runIsMainModule();
