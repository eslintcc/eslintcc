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

  ['test: Ranks.getLabel(Min/Max)Value']() {
    const minValues = ['A', 'B', 'C', 'D', 'E', 'F'].map(Ranks.getLabelMinValue);
    deepEqual([0, 1, 2, 3, 4, 5], minValues);
    const maxValues = ['A', 'B', 'C', 'D', 'E', 'F'].map(Ranks.getLabelMaxValue);
    deepEqual([1, 2, 3, 4, 5, Infinity], maxValues);
  }

}


module.exports = TestRank;
TestRank.runIsMainModule();
