'use strict';

const {
  child_process: { exec, execAndGetOutput },
  fs: { readFile, writeFile, readFileJSON, writeFileJSON }
} = require('@nd-toolkit/ndk-project');

const npmjsRegistry = '//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n';


exec('eslint . --ignore-pattern test/src --max-warnings 0');
exec('node source/cli source --greater-than C --show-rules --average');
exec('nyc --reporter=lcovonly node test');
exec('nyc report');
exec('coveralls < coverage/lcov.info');

if (process.env.TRAVIS_BRANCH !== 'master' || process.env.TRAVIS_PULL_REQUEST !== 'false') {
  // Если это не master ветка, дальнейшие шаги не требуются
  process.exit(0);
}

writeFile('.npmrc', npmjsRegistry + readFile('.npmrc'));
exec('npm i semver@latest');

const { lt, inc } = require('semver');
const packageJSON = readFileJSON('package.json');

// Проверяем версию для публикации
if (lt(execAndGetOutput('npm view eslintcc version'), packageJSON.version)) {
  exec('npm publish');
}

// Проверяем обновление версии ESLint
exec('npm i eslint@latest');
const eslintVersion = readFileJSON('node_modules/eslint/package.json').version;
const semverVersion = readFileJSON('node_modules/semver/package.json').version;
if (lt(packageJSON.dependencies.eslint, eslintVersion)) {
  // Обновление и тестирование с новым ESLint
  packageJSON.dependencies.eslint = eslintVersion;
  packageJSON.devDependencies.semver = semverVersion;
  packageJSON.version = inc(packageJSON.version, 'patch');
  writeFileJSON('package.json', packageJSON);
  exec('node test');
  exec('git config user.email igor.github.bot@gmail.com');
  exec('git config user.name igor-github-bot');
  exec('git checkout master');
  exec('git remote add origin-master https://${GITHUB_ACCESS_TOKEN}@github.com/eslintcc/eslintcc');
  exec('git add package.json');
  exec(`git commit -m "Обновление до eslint@${eslintVersion}"`);
  exec('git push origin-master');
  exec('git remote remove origin-master');
  exec('npm publish');
}
