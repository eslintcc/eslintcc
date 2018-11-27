'use strict';
const { createTest } = require('@ndk/test');


const AllTests = createTest('All tests', {

  ['test: patching_eslint']: require('./patching_eslint'),

  ['test: rank']: require('./rank'),

  ['test: complexity']: require('./complexity'),

  ['test: logging']: require('./logging'),

  ['test: cli']: require('./cli')

});


module.exports = AllTests;
AllTests.runIsMainModule();
