'use strict';

const rankLabels = ['A', 'B', 'C', 'D', 'E', 'F'];


class Ranks {

  get defaultRanks() {
    // The maximum complexity value for rule, associated with the rank
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
        D: 5,
        E: 6,
        F: Infinity
      },
      'max-nested-callbacks': {
        A: 3,
        B: 5,
        C: 10,
        D: 20,
        E: 30,
        F: Infinity
      },
      'max-params': {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
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
          if (rankName in ranks) {
            ranks[ruleID][rankName] = Number(customRanks[rankName]);
          }
        }
      }
    }
    this.ranks = ranks;
    Object.assign(this, ranks);
  }

  getValue(ruleID, value) {
    const ranks = this.ranks[ruleID];
    for (let i = 0; i < rankLabels.length; i++) {
      const rankMaxValue = ranks[rankLabels[i]];
      if (value <= rankMaxValue) {
        const prevMaxValue = ranks[rankLabels[i - 1]] || 0;
        return i + (value - prevMaxValue) / (rankMaxValue - prevMaxValue);
      }
    }
  }

  getLabel(ruleID, value) {
    const ranks = this.ranks[ruleID];
    for (const name in ranks) {
      if (value < ranks[name]) {
        return name;
      }
    }
  }

}


exports.Ranks = Ranks;
