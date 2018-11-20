'use strict';
const { createTest } = require('@ndk/test');


const AllTests = createTest('All tests', {

  ['test: patching_eslint']: require('./patching_eslint')

});


module.exports = AllTests;
AllTests.runIsMainModule();
