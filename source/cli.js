'use strict';

const { getProcessArgs } = require('@ndk/env/args');

const { Complexity } = require('./complexity');
const { ReportLogger } = require('./lib/logging');

const processArgs = getProcessArgs({
  types: {
    rules: 'Array',
    format: 'Option',
    showRules: 'Flag',
    greaterThan: 'Option',
    lessThan: 'Option'
  },
  aliases: {
    rules: 'r',
    format: 'f',
    showRules: ['show-rules', 'sr'],
    greaterThan: ['greater-than', 'gt'],
    lessThan: ['less-than', 'lt']
  }
});


if (processArgs.argv.length > 0) {
  const options = Object.assign({}, processArgs.flags, processArgs.options);
  const complexity = new Complexity(options);
  new ReportLogger(complexity, options);
  complexity.executeOnFiles(processArgs.argv);
} else {
  console.log(require('./lib/help'));
}
