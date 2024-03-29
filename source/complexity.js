const EventEmitter = require('events')
const { patchingESLint, PatchedESLint } = require('./lib/eslint-patches')
const { Ranks } = require('./lib/rank')
const { ReportGenerator } = require('./lib/report')

const allComplexityRules = {
  'complexity': ['error', 0],
  'max-depth': ['error', 0],
  // 'max-len': ['error', 1], // TODO: https://github.com/IgorNovozhilov/eslintcc/issues/1
  'max-lines': ['error', 0],
  'max-lines-per-function': ['error', { max: 0 }],
  'max-nested-callbacks': ['error', 0],
  'max-params': ['error', 0],
  'max-statements': ['error', 0]
}
const ruleCategories = {
  all: allComplexityRules,
  logic: {
    'complexity': allComplexityRules.complexity,
    'max-depth': allComplexityRules['max-depth'],
    'max-nested-callbacks': allComplexityRules['max-nested-callbacks'],
    'max-params': allComplexityRules['max-params']
  },
  raw: {
    // 'max-len': allComplexityRules['max-len'],
    'max-lines': allComplexityRules['max-lines'],
    'max-lines-per-function': allComplexityRules['max-lines-per-function'],
    'max-statements': allComplexityRules['max-statements']
  }
}


// Patching ESLint behavior, for use as a metrics generator
patchingESLint()


class Complexity {

  constructor({
    rules = 'logic',
    greaterThan = undefined,
    lessThan = undefined,
    ranks = null,
    noInlineConfig = false,
    maxRank = 'C',
    maxAverageRank = 'B',
    eslintOptions = {}
  } = {}) {
    this.options = {
      ranks: new Ranks(ranks),
      rules,
      greaterThan: Ranks.getLabelMaxValue(greaterThan),
      lessThan: Ranks.getLabelMinValue(lessThan),
      noInlineConfig,
      maxRank: Ranks.getLabelMaxValue(maxRank),
      maxAverageRank: Ranks.getLabelMaxValue(maxAverageRank)
    }
    this.eslintOptions = eslintOptions
    this.events = new EventEmitter()
  }

  getComplexityRules(customCategory) {
    const category = customCategory || this.options.rules

    if (category instanceof Array) {
      const rules = {}

      for (const ctg of category) {
        Object.assign(rules, this.getComplexityRules(ctg))
      }

      return rules
    } else {
      if (category in allComplexityRules) {
        return {
          [category]: allComplexityRules[category]
        }
      } else if (category in ruleCategories) {
        return ruleCategories[category]
      } else {
        return ruleCategories.logic
      }
    }
  }

  async lintFiles(patterns) {
    /** @type {object} */
    const eslintOptions = Object.assign({}, this.eslintOptions, {})

    if (this.options.noInlineConfig) {
      eslintOptions.allowInlineConfig = false
    }
    if (eslintOptions.overrideConfig && eslintOptions.overrideConfig.rules) {
      eslintOptions.overrideConfig.rules = Object.assign({},
        eslintOptions.overrideConfig.rules,
        this.getComplexityRules())
    } else {
      eslintOptions.overrideConfig = Object.assign(eslintOptions.overrideConfig || {},
        { rules: this.getComplexityRules() })
    }

    const engine = new PatchedESLint(eslintOptions)
    const generator = new ReportGenerator(this.options)

    engine.events.on('verifyFile', (...args) => {
      this.events.emit('verifyFile', generator.verifyFile(...args))
    })
    await engine.lintFiles(patterns)
    generator.finish()
    this.events.emit('finish', generator.report)

    return generator.report
  }

}


exports.Complexity = Complexity
