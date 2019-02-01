'use strict';

const { exec } = require('./lib');


exec('nyc node test');
exec('nyc report --reporter=html');
