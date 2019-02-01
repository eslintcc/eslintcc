'use strict';

const { exec } = require('./lib');


exec('nyc --exclude=bin --exclude=coverage --exclude=!test node test');
exec('nyc report --reporter=html');
