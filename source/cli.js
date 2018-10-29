'use strict';

const { getProcessArgs } = require('@ndk/env/args');

const { Complexity } = require('./complexity');
const { ReportLogger } = require('./logging');

const processArgs = getProcessArgs({
  types: {
    gt: 'Option'
  }
});



if (processArgs.argv.length > 0) {
  const complexity = new Complexity({
    complexity: processArgs.options.gt ? parseInt(processArgs.options.gt) : undefined
  });
  const report = complexity.executeOnFiles(processArgs.argv);
  new ReportLogger(report).log();
} else {
  console.log(require('./help'));
}
