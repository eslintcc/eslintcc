'use strict';

const { execSync } = require('child_process');


function __exec(cwd, command, options) {
  if (typeof command === 'undefined') {
    [cwd, command] = [command, cwd];
  }
  return execSync(command, Object.assign({ cwd, encoding: 'utf-8' }, options));
}


function exec(cwd, command) {
  return __exec(cwd, command, { stdio: 'inherit' });
}


function execAndGetOutput(cwd, command) {
  return __exec(cwd, command, { stdio: ['inherit', 'pipe', 'inherit'] }).trim();
}


exports.exec = exec;
exports.execAndGetOutput = execAndGetOutput;
