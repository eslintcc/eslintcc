'use strict';


class Ranks {

  get defaultRanks() {
    // The maximum complexity value associated with the rank
    return {
      A: 5,
      B: 10,
      C: 20,
      D: 30,
      E: 40,
      F: Infinity
    };
  }

  constructor(customRanks = {}) {
    const ranks = this.defaultRanks;
    for (let rankName in customRanks) {
      rankName = rankName.toUpperCase();
      if (rankName in ranks) {
        ranks[rankName] = Number(customRanks[rankName]);
      }
    }
    this.ranks = ranks;
    Object.assign(this, ranks);
  }

  getName(value) {
    for (const name in this.ranks) {
      if (value < this.ranks[name]) {
        return name;
      }
    }
  }

}


exports.Ranks = Ranks;
