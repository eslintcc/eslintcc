'use strict';

const EventEmitter = require('events');

const { patchingESLint, PatchedCLIEngine } = require('./lib/eslint-patches');
const { Ranks } = require('./lib/rank');
const { ReportGenerator } = require('./lib/report');

const allComplexityRules = {
  'complexity': ['error', 0],
  'max-depth': ['error', 0],
  //'max-len': ['error', 1], // TODO: https://github.com/IgorNovozhilov/eslintcc/issues/1
  'max-lines': ['error', 0],
  'max-lines-per-function': ['error', { max: 0 }],
  'max-nested-callbacks': ['error', 0],
  'max-params': ['error', 0],
  'max-statements': ['error', 0]
};
const ruleCategories = {
  all: allComplexityRules,
  logic: {
    'complexity': allComplexityRules['complexity'],
    'max-depth': allComplexityRules['max-depth'],
    'max-nested-callbacks': allComplexityRules['max-nested-callbacks'],
    'max-params': allComplexityRules['max-params']
  },
  raw: {
    //'max-len': allComplexityRules['max-len'],
    'max-lines': allComplexityRules['max-lines'],
    'max-lines-per-function': allComplexityRules['max-lines-per-function'],
    'max-statements': allComplexityRules['max-statements']
  }
};


// Patching ESLint behavior, for use as a metrics generator
patchingESLint();


class Complexity {

  constructor({
    rules = 'logic',
    greaterThan = undefined,
    lessThan = undefined,
    ranks = null,
    noInlineConfig = false,
    maxRank = 'C',
    maxAverageRank = 'B'
  } = {}) {
    this.options = {
      ranks: new Ranks(ranks),
      rules: rules,
      greaterThan: Ranks.getLabelMaxValue(greaterThan),
      lessThan: Ranks.getLabelMinValue(lessThan),
      noInlineConfig: noInlineConfig,
      maxRank: Ranks.getLabelMaxValue(maxRank),
      maxAverageRank: Ranks.getLabelMaxValue(maxAverageRank)
    };
    this.events = new EventEmitter();
  }

  getComplexityRules(customCategory) {
    const category = customCategory || this.options.rules;
    if (category instanceof Array) {
      const rules = {};
      for (const ctg of category) {
        Object.assign(rules, this.getComplexityRules(ctg));
      }
      return rules;
    } else {
      if (category in allComplexityRules) {
        return {
          [category]: allComplexityRules[category]
        };
      } else if (category in ruleCategories) {
        return ruleCategories[category];
      } else {
        return ruleCategories['logic'];
      }
    }
  }

  executeOnFiles(patterns) {
    const engine = new PatchedCLIEngine({
      allowInlineConfig: !this.options.noInlineConfig,
      rules: this.getComplexityRules()
    });
    const generator = new ReportGenerator(this.options);
    engine.events.on('verifyFile', (...args) => {
      this.events.emit('verifyFile', generator.verifyFile(...args));
    });
    engine.executeOnFiles(patterns);
    generator.finish();
    this.events.emit('finish', generator.report);
    return generator.report;
  }

}


exports.Complexity = Complexity;
