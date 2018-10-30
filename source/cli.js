'use strict';

const { getProcessArgs } = require('@ndk/env/args');

const { Complexity } = require('./complexity');
const { ReportLogger } = require('./logging');

const processArgs = getProcessArgs({
  types: {
    greaterThan: 'Option',
    lessThan: 'Option'
  },
  aliases: {
    greaterThan: ['greater-than', 'gt'],
    lessThan: ['less-than', 'lt']
  }
});


if (processArgs.argv.length > 0) {
  const complexity = new Complexity(Object.assign({}, processArgs.flags, processArgs.options));
  const report = complexity.executeOnFiles(processArgs.argv);
  new ReportLogger(report).log();
} else {
  console.log(require('./help'));
}
