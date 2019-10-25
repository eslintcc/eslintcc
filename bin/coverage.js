'use strict';

const {
  child_process: { exec }
} = require('./lib');


exec('nyc node test');
exec('nyc report --reporter=html');
