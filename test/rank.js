'use strict';

const { equal, deepEqual } = require('assert').strict;

const { Test } = require('@ndk/test');

const { Ranks } = require('../source/lib/rank');


class TestRank extends Test {

  get name() {
    return 'Ranks';
  }

  ['test: init']() {
    const ranks = new Ranks();
    deepEqual({ A: 5, B: 10, C: 20, D: 30, E: 40, F: Infinity }, ranks.ranks.complexity);
    equal(undefined, ranks.ranks.complexity_);
  }

  ['test: ~customRulesRanks']() {
    const customRulesRanks = { A: 11, B: 22, C: 33, D: 44, E: 55, F: Infinity, G: 100 };
    const ranks = new Ranks({ 'complexity': customRulesRanks, 'complexity_': customRulesRanks });
    deepEqual({ A: 11, B: 22, C: 33, D: 44, E: 55, F: Infinity }, ranks.ranks.complexity);
    equal(undefined, ranks.ranks.complexity_);
  }

  ['test: .getLabel(Min/Max)Value']() {
    const minValues = ['A', 'B', 'C', 'D', 'E', 'F', 50, '10', 'G'].map(Ranks.getLabelMinValue);
    deepEqual([0, 1, 2, 3, 4, 5, 50, 10, null], minValues);
    const maxValues = ['A', 'B', 'C', 'D', 'E', 'F', 50, '10', 'G'].map(Ranks.getLabelMaxValue);
    deepEqual([1, 2, 3, 4, 5, Infinity, 50, 10, null], maxValues);
  }

  ['test: .getMaxValue']() {
    const maxValue = Ranks.getMaxValue();
    deepEqual({ rankValue: 6, rankLabel: 'F' }, maxValue);
  }

  ['test: #getValue']() {
    const ranks = new Ranks();
    const getValue = value => ranks.getValue('complexity', value);
    deepEqual([
      { rankLabel: 'A', rankValue: 0 },
      { rankLabel: 'A', rankValue: 0.5 },
      { rankLabel: 'A', rankValue: 1 }
    ], [0, 2.5, 5].map(getValue));
    deepEqual([
      { rankLabel: 'B', rankValue: 1.2 },
      { rankLabel: 'B', rankValue: 1.4 },
      { rankLabel: 'B', rankValue: 2 }
    ], [6, 7, 10].map(getValue));
    deepEqual([
      { rankLabel: 'C', rankValue: 2.2 },
      { rankLabel: 'C', rankValue: 2.5 },
      { rankLabel: 'C', rankValue: 3 }
    ], [12, 15, 20].map(getValue));
    deepEqual([
      { rankLabel: 'D', rankValue: 3.3 },
      { rankLabel: 'D', rankValue: 3.9 },
      { rankLabel: 'D', rankValue: 4 }
    ], [23, 29, 30].map(getValue));
    deepEqual([
      { rankLabel: 'E', rankValue: 4.2 },
      { rankLabel: 'E', rankValue: 4.5 },
      { rankLabel: 'E', rankValue: 5 }
    ], [32, 35, 40].map(getValue));
    deepEqual([
      { rankLabel: 'F', rankValue: 5.025 },
      { rankLabel: 'F', rankValue: 5.5 },
      { rankLabel: 'F', rankValue: 6 },
      { rankLabel: 'F', rankValue: 7.25 }
    ], [41, 60, 80, 130].map(getValue));
  }

  ['test: #getValue - fractions']() {
    const ranks = new Ranks();
    const getValue = value => ranks.getValue('max-nested-callbacks', value);
    deepEqual([
      { rankLabel: 'A', rankValue: 0.333 },
      { rankLabel: 'A', rankValue: 0.833 },
      { rankLabel: 'B', rankValue: 1.7 }
    ], [1, 2.5, 4.4].map(getValue));
  }
}


module.exports = TestRank;
TestRank.runIsMainModule();
