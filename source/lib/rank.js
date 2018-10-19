'use strict';

// The maximum complexity value associated with the rank
const defaultRanks = {
  A: 5,
  B: 10,
  C: 20,
  D: 30,
  E: 40,
  F: Infinity
};


function resolveRanks(ranks) {
  return Object.assign({}, defaultRanks, ranks || {});
}


function resolveRankLabel(value, customRanks) {
  const maxRanks = customRanks || defaultRanks;
  for (const label in maxRanks) {
    if (value < maxRanks[label]) {
      return label;
    }
  }
}


exports.resolveRanks = resolveRanks;
exports.resolveRankLabel = resolveRankLabel;
