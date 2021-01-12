'use strict';
const { Test } = require('../build/@nodutilus-test');


class AllTests extends Test {}


AllTests['test: patching_eslint'] = require('./patching_eslint');
AllTests['test: rank'] = require('./rank');
AllTests['test: complexity'] = require('./complexity');
AllTests['test: logging'] = require('./logging');
AllTests['test: cli'] = require('./cli');
AllTests['test: code_parts'] = require('./code_parts');


Test.runOnCI(new AllTests());
