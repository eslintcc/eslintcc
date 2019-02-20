'use strict';

module.exports = `eslintcc [options] file.js [file.js] [dir]

Rules used:
  logic:  complexity, max-depth, max-nested-callbacks, max-params
  raw:    max-lines, max-lines-per-function, max-statements
  all:    logic + raw

Options:
  --rules <rules>, -r=<rules>                 Array of String     Rule, or group: all, logic, raw. Default: logic
  --format <format>, -f=<format>              String              Use a specific output format, text or json. Default: text
  --average, -a                               Flag                Show the average complexity at the end of output, if used text format
  --show-rules, -sr                           Flag                Show rule name and value, if used text format
  --greater-than <value>, -gt=<value>         String or Number    Will show rules more than rank a, b, c, d, e, or rank value
  --less-than <value>, -lt=<value>            String or Number    Will show rules less than rank b, c, d, e, f, or rank value
  --no-inline-config, -nlc                    Flag                Disable the use of configuration comments (such as /*eslint-disable*/)
  --max-rank <value>, -mr=<value>             String or Number    Maximum allowed complexity rank for a single message. Default: C
  --max-average-rank <value>, -mar=<value>    String or Number    Maximum allowed complexity rank for average value. Default: B

Examples:
  $ eslintcc -f=json -gt=e file.js
  $ eslintcc --rules complexity --rules max-depth --show-rules file.js
`;
