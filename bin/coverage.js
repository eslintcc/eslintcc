'use strict';

const {
  child_process: { exec }
} = require('@nd-toolkit/ndk-project');


exec('nyc node test');
exec('nyc report --reporter=html');
