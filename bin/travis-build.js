'use strict';

const { exec, readJSON, writeJSON } = require('./lib');


exec('eslint . --ignore-pattern test/src');
exec('nyc --reporter=lcovonly node test');
exec('nyc report');
exec('coveralls < coverage/lcov.info');

// Проверяем обновление версии ESLint
exec('npm i eslint@latest semver@latest');
const packageJSON = readJSON('package.json');
const eslintVersion = '^' + readJSON('node_modules/eslint/package.json').version;
const semver = '^' + readJSON('node_modules/semver/package.json').version;
if (packageJSON.dependencies.eslint !== eslintVersion) {
  // Обновление и тестирование с новым ESLint
  packageJSON.dependencies.eslint = eslintVersion;
  packageJSON.devDependencies.semver = semver;
  packageJSON.version = require('semver').inc(packageJSON.version, 'patch');
  writeJSON('package.json', packageJSON);
  exec('node test');
  exec('git config user.email igor.github.bot@gmail.com');
  exec('git config user.name igor-github-bot');
  exec('git checkout master');
  exec('git remote add origin-master https://${GITHUB_ACCESS_TOKEN}@github.com/eslintcc/eslintcc');
  exec(`git commit -a -m "Обновление до eslint@${eslintVersion.slice(1)}"`);
  exec('git push origin-master');
  exec('git remote remove origin-master');
  exec('npm publish');
}
