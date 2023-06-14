const {
  child_process: { exec }
} = require('./lib')


exec('eslint . --ignore-pattern test/src --max-warnings 0')
exec('node source/cli source --greater-than C --show-rules --average')
exec('nyc --reporter=text node test')
