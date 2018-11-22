'use strict';
const { createTest } = require('@ndk/test');


const AllTests = createTest('All tests', {

  ['test: patching_eslint']: require('./patching_eslint'),

  ['test: rank']: require('./rank'),

  ['test: logging']: require('./logging')

});


module.exports = AllTests;
AllTests.runIsMainModule();
