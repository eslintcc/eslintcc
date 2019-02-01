'use strict';

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');


function exec(command) {
  execSync(command, {
    input: 'inherit',
    stdio: 'inherit',
    encoding: 'utf-8'
  });
}


function readJSON(file) {
  return JSON.parse(readFileSync(file, 'utf-8'));
}


function writeJSON(file, data) {
  return writeFileSync(file, JSON.stringify(data, null, '  '), 'utf-8');
}


exports.exec = exec;
exports.readJSON = readJSON;
exports.writeJSON = writeJSON;
