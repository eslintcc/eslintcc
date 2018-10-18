'use strict';

const { Complexity } = require('./complexity');
const { ReportLogger } = require('./logging');


function parseArgs() {
  const options = {};
  const args = process.argv.slice(2);
  const gt = parseInt(args[args.indexOf('-gt') + 1]);
  if (!isNaN(gt)) {
    options.complexity = gt;
  }
  return options;
}

new ReportLogger(new Complexity(parseArgs()).executeOnFiles(['.'])).log();
