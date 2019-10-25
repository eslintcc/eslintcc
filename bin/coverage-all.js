'use strict';

const {
  child_process: { exec }
} = require('./lib');


exec('nyc --exclude=bin --exclude=coverage --exclude=!test node test');
exec('nyc report --reporter=html');
