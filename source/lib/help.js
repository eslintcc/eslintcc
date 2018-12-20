'use strict';

module.exports = `eslintcc [options] file.js [file.js] [dir]

Rules used:
  logic:  complexity, max-depth, max-nested-callbacks, max-params
  raw:    max-lines, max-lines-per-function, max-statements
  all:    logic + raw

Options:
  --rules <rules>, -r=<rules>            Array of String     Rule, or group: all, logic, raw. Default: logic
  --format <format>, -f=<format>         String              Use a specific output format, text or json. Default: text
  --show-rules, -sr                      Flag                Show rule name and value, if used text format
  --greater-than <value>, -gt=<value>    String or Number    Will show rules more than rank a, b, c, d, e, or rank value
  --less-than <value>, -lt=<value>       String or Number    Will show rules less than rank b, c, d, e, f, or rank value

Examples:
  $ eslintcc -f=json -gt=e file.js
  $ eslintcc --rules complexity --rules max-depth --show-rules file.js
`;
