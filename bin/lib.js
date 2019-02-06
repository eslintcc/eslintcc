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


function readFile(file) {
  return readFileSync(file, 'utf-8');
}


function readJSON(file) {
  return JSON.parse(readFile(file));
}


function writeFile(file, data) {
  writeFileSync(file, data, 'utf-8');
}


function writeJSON(file, data) {
  writeFile(file, JSON.stringify(data, null, '  '));
}


exports.exec = exec;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.readJSON = readJSON;
exports.writeJSON = writeJSON;
