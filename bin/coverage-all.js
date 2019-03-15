'use strict';

const {
  child_process: { exec }
} = require('@nd-toolkit/ndk-project');


exec('nyc --exclude=bin --exclude=coverage --exclude=!test node test');
exec('nyc report --reporter=html');
