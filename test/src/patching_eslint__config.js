'use strict';

const { PatchedCLIEngine } = require('../../source/lib/eslint-patches.js');


console.log(JSON.stringify(new PatchedCLIEngine().getConfigForFile('.')));
