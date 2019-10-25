'use strict';

const {
  mkdirSync,
  rmdirSync,
  readFileSync,
  existsSync,
  writeFileSync,
  symlinkSync,
  readdirSync,
  statSync,
  lstatSync,
  readlinkSync,
  unlinkSync
} = require('fs');
const { resolve, join, dirname } = require('path');


function mkdir(dir) {
  if (!existsSync(dir)) {
    const prnt = dirname(dir);
    if (!existsSync(prnt)) {
      mkdir(prnt);
    }
    mkdirSync(dir);
  }
}


function rmdir(dir) {
  if (existsSync(dir)) {
    rmdirSync(dir);
  }
}


function readFile(file) {
  return readFileSync(file, 'utf-8');
}


function readFileJSON(file) {
  return JSON.parse(readFile(file));
}


function writeFile(file, data) {
  if (!existsSync(file) || data !== readFile(file)) {
    writeFileSync(file, data, 'utf-8');
  }
}


function writeFileJSON(file, json) {
  writeFile(file, JSON.stringify(json, null, '  '));
}


function __symlink(target, path) {
  const stat = statSync(target);
  if (stat.isDirectory()) {
    const files = readdirSync(target);
    mkdir(path);
    for (const file of files) {
      __symlink(join(target, file), join(path, file));
    }
  } else {
    symlinkSync(target, path);
  }
}


function symlink(target, path) {
  target = resolve(target);
  path = resolve(path);
  if (existsSync(path)) {
    const statT = statSync(target);
    const statP = lstatSync(path);
    if (statT.isDirectory() && statP.isDirectory()) {
      const files = readdirSync(target);
      const rmFiles = readdirSync(path)
        .reduce((prev, cur) => !files.includes(cur) && prev.push(cur) && prev || prev, []);
      for (const file of files) {
        symlink(join(target, file), join(path, file));
      }
      for (const file of rmFiles) {
        unlink(join(path, file));
      }
    } else if (statT.isFile() && statP.isSymbolicLink()) {
      const lpath = readlinkSync(path);
      if (target !== lpath) {
        unlinkSync(path);
        __symlink(target, path);
      }
    } else {
      throw 'symlink вызван для несовместимой структуры каталогов';
    }
  } else {
    __symlink(target, path);
  }
}


function unlink(path) {
  const stat = lstatSync(path);
  if (stat.isDirectory()) {
    const files = readdirSync(path);
    for (const file of files) {
      unlink(resolve(path, file));
    }
    rmdir(path);
  } else {
    unlinkSync(path);
  }
}


exports.mkdir = mkdir;
exports.rmdir = rmdir;
exports.readFile = readFile;
exports.readFileJSON = readFileJSON;
exports.writeFile = writeFile;
exports.writeFileJSON = writeFileJSON;
exports.exists = existsSync;
exports.symlink = symlink;
exports.unlink = unlink;
