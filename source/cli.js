'use strict';

const { getProcessArgs } = require('./lib/args');

const { Complexity } = require('./complexity');
const { ReportLogger } = require('./lib/logging');

const processArgs = getProcessArgs({
  types: {
    rules: 'Array',
    format: 'Option',
    average: 'Flag',
    showRules: 'Flag',
    greaterThan: 'Option',
    lessThan: 'Option',
    noInlineConfig: 'Flag',
    maxRank: 'Option',
    maxAverageRank: 'Option'
  },
  aliases: {
    rules: 'r',
    format: 'f',
    average: 'a',
    showRules: ['show-rules', 'sr'],
    greaterThan: ['greater-than', 'gt'],
    lessThan: ['less-than', 'lt'],
    noInlineConfig: ['no-inline-config', 'nlc'],
    maxRank: ['max-rank', 'mr'],
    maxAverageRank: ['max-average-rank', 'mar']
  }
});


if (processArgs.argv.length > 0) {
  const options = Object.assign({}, processArgs.flags, processArgs.options);
  const complexity = new Complexity(options);
  new ReportLogger(complexity, options);
  const report = complexity.executeOnFiles(processArgs.argv);
  const exitWithError = report.errors.maxRank > 0 || report.errors.maxAverageRank;
  if (exitWithError) {
    process.exit(1);
  }
} else {
  console.log(require('./lib/help'));
}
