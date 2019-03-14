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

  ['test: .roundValue']() {
    equal(0.123, Ranks.roundValue(0.1234));
    equal(0.123, Ranks.roundValue(0.1239));
  }

  ['test: .getLabel(Min/Max)Value']() {
    const minValues = ['A', 'B', 'C', 'D', 'E', 'F', 50, '10', 'G'].map(Ranks.getLabelMinValue);
    deepEqual([0, 1, 2, 3, 4, 5, 50, 10, null], minValues);
    const maxValues = ['A', 'B', 'C', 'D', 'E', 'F', 50, '10', 'G'].map(Ranks.getLabelMaxValue);
    deepEqual([1, 2, 3, 4, 5, Infinity, 50, 10, null], maxValues);
  }

  ['test: .getMaxValue']() {
    const maxValue = Ranks.getMaxValue();
    deepEqual({ rank: 6, label: 'F' }, maxValue);
  }

  ['test: .getLabelByValue']() {
    equal('A', Ranks.getLabelByValue(0));
    equal('A', Ranks.getLabelByValue(0.1234));
    equal('B', Ranks.getLabelByValue(1.1234));
    equal('B', Ranks.getLabelByValue(2));
    equal('C', Ranks.getLabelByValue(2.1));
    equal('D', Ranks.getLabelByValue(3.9));
    equal('E', Ranks.getLabelByValue(4.2));
    equal('F', Ranks.getLabelByValue(5.2));
    equal('F', Ranks.getLabelByValue(50.2));
  }

  ['test: #getValue']() {
    const ranks = new Ranks();
    const getValue = value => ranks.getValue('complexity', value);
    deepEqual([
      { label: 'A', rank: 0 },
      { label: 'A', rank: 0.5 },
      { label: 'A', rank: 1 }
    ], [0, 2.5, 5].map(getValue));
    deepEqual([
      { label: 'B', rank: 1.2 },
      { label: 'B', rank: 1.4 },
      { label: 'B', rank: 2 }
    ], [6, 7, 10].map(getValue));
    deepEqual([
      { label: 'C', rank: 2.2 },
      { label: 'C', rank: 2.5 },
      { label: 'C', rank: 3 }
    ], [12, 15, 20].map(getValue));
    deepEqual([
      { label: 'D', rank: 3.3 },
      { label: 'D', rank: 3.9 },
      { label: 'D', rank: 4 }
    ], [23, 29, 30].map(getValue));
    deepEqual([
      { label: 'E', rank: 4.2 },
      { label: 'E', rank: 4.5 },
      { label: 'E', rank: 5 }
    ], [32, 35, 40].map(getValue));
    deepEqual([
      { label: 'F', rank: 5.025 },
      { label: 'F', rank: 5.5 },
      { label: 'F', rank: 6 },
      { label: 'F', rank: 7.25 }
    ], [41, 60, 80, 130].map(getValue));
  }

  ['test: #getValue - fractions']() {
    const ranks = new Ranks();
    const getValue = value => ranks.getValue('max-nested-callbacks', value);
    deepEqual([
      { label: 'A', rank: 0.333 },
      { label: 'A', rank: 0.833 },
      { label: 'B', rank: 1.7 }
    ], [1, 2.5, 4.4].map(getValue));
  }
}


module.exports = TestRank;
TestRank.runIsMainModule();
