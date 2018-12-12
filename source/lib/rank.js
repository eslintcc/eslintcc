'use strict';

const rankLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
const rankLabelsMaxValue = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: Infinity
};


class Ranks {

  static getLabelMaxValue(label) {
    label = String(label).toUpperCase();
    const maxValue = rankLabelsMaxValue[label] || Number(label);
    if (isNaN(maxValue)) {
      return null;
    } else {
      return maxValue;
    }
  }

  static getLabelMinValue(label) {
    label = String(label).toUpperCase();
    const minValue = rankLabels.includes(label) ? rankLabels.indexOf(label) : Number(label);
    if (isNaN(minValue)) {
      return null;
    } else {
      return minValue;
    }
  }

  static getMaxValue() {
    return {
      rankValue: rankLabelsMaxValue['E'] + 1,
      rankLabel: 'F'
    };
  }

  get defaultRanks() {
    // The maximum complexity score for rule, associated with the rank
    // 'complexity' corresponds https://radon.readthedocs.io/en/latest/api.html#radon.complexity.cc_rank.
    // The rest are calculated relative to the default score for the rule.
    // Example formula for calculating the score relations:
    //  [5, 10, 20, 30, 40].map(score => Math.round((score / 20) * defaultRuleScoreLimit))

    return {
      'complexity': {
        A: 5,
        B: 10,
        C: 20,
        D: 30,
        E: 40,
        F: Infinity
      },
      'max-depth': {
        A: 2,
        B: 3,
        C: 4,
        D: 6,
        E: 8,
        F: Infinity
      },
      //'max-len': {},
      //'max-lines': {},
      'max-lines-per-function': {
        A: 13,
        B: 25,
        C: 50,
        D: 75,
        E: 100,
        F: Infinity
      },
      'max-nested-callbacks': {
        A: 3,
        B: 5,
        C: 10,
        D: 15,
        E: 20,
        F: Infinity
      },
      'max-params': {
        A: 1,
        B: 2,
        C: 3,
        D: 5,
        E: 6,
        F: Infinity
      },
      'max-statements': {
        A: 3,
        B: 5,
        C: 10,
        D: 15,
        E: 20,
        F: Infinity
      }
    };
  }

  constructor(customRulesRanks = {}) {
    const ranks = this.defaultRanks;
    for (const ruleID in customRulesRanks) {
      if (ruleID in ranks) {
        const customRanks = customRulesRanks[ruleID];
        for (let rankName in customRanks) {
          rankName = rankName.toUpperCase();
          if (rankName in ranks[ruleID]) {
            ranks[ruleID][rankName] = Number(customRanks[rankName]);
          }
        }
      }
    }
    this.ranks = ranks;
  }

  getValue(ruleID, value) {
    const ranks = this.ranks[ruleID];
    for (let i = 0; i < rankLabels.length; i++) {
      const rankLabel = rankLabels[i];
      const rankMaxValue = ranks[rankLabel];
      if (value <= rankMaxValue) {
        const prevMaxValue = ranks[rankLabels[i - 1]] || 0;
        const range = rankMaxValue === Infinity ? prevMaxValue : rankMaxValue - prevMaxValue;
        return {
          rankValue: ((i + (value - prevMaxValue) / range) * 1000 ^ 0) / 1000,
          rankLabel: rankLabel
        };
      }
    }
  }

}


exports.Ranks = Ranks;
