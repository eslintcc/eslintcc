# ESLint Complexity of Code [![npm][npm_img]][npm_url] [![Build Status][build_img]][build_url] [![Coverage Status][coverage_img]][coverage_url]

[ESLintCC][npm_url] is a ECMAScript/JavaScript tool
  that computes complexity of code by using [ESLint][eslint_npm]

> ESLint calculates complexity of code,
> while this tool only collects a report based on his [complexity rule messages][eslint_rule]

## Installation and Usage

> Requirements, principles of local and global installation and usage
>   are the same as [ESLint Installation and Usage][eslint_usage]

Globally:

    $ npm install -g eslintcc
    $ eslintcc yourfile.js

Locally:

    $ npm install eslintcc
    $ ./node_modules/.bin/eslintcc yourfile.js

NPX (you can do it without installing):

    $ npx eslintcc yourfile.js

Integration in JavaScript application:

```js
const { Complexity } = require('eslintcc');

const complexity = new Complexity();
const report = complexity.executeOnFiles(['yourfile.js']);

console.log(JSON.stringify(report, null, '\t'));
```

**Note:** ESLintCC ignores all rules, specified in configuration files,
    and uses to generate a report only [complexity rules][eslint_rule].

## Configuration

ESLintCC uses ESLint along with [Its configuration system][eslint_config].
You can use configuration comments and files, as described in the configuration for ESLint.

**Difference:** ESLintCC uses its own settings for complexity rules,
  so they cannot be overridden through a configuration file.
However, you can disable them locally in the file.

**Features:**

1.  You can configurate [parserOptions][eslint_parser_options]
    or [parser][eslint_parser] for specify the JavaScript language support. `.eslintrc.json`:

```json
{
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  }
}
```

```json
{
  "parser": "@typescript-eslint/parser"
}
```

2.  You can disable checks for a specific complexity rule for a file or part of file
    [using a comment][eslint_disabling_comments]:

```js
// For a file
/* eslint max-params: off, max-depth: off */

function myFunc(a, b, c, d, e) {
  //...
}
```

```js
// For a block
/* eslint-disable max-params */
function myFunc(a, b, c, d, e) {
  //...
}
/* eslint-enable max-params */
function myFunc2(a, b) {
  //...
}
```

```js
// For a line
/* eslint-disable-next-line max-params */
function myFunc(a, b, c, d, e) {
  //...
}
```

## Customize parser

Examples of [ESLint Parser][eslint_parser] configuration

### Babel parser

Using Babel you can support experimental syntax.
For example private fields and methods for classes.

> See package [@babel/eslint-parser](https://www.npmjs.com/package/@babel/eslint-parser)

package.json

```json
{
  "devDependencies": {
    "@babel/eslint-parser": "latest",
    "@babel/plugin-proposal-class-properties": "latest",
    "@babel/plugin-proposal-private-methods": "latest"
  }
}
```

.eslintrc.json

```json
{
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "sourceType": "module",
    "babelOptions": {
      "configFile": "./babel.config.json"
    }
  }
}
```

.babel.config.json

```json
{
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-private-methods"
  ]
}
```

### TypeScript parser

> See package [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser)

This parser is used you can add a code complexity score to your TypeScript project.
In this case, the same standard ESLint rules are used for calculating complexity,
  [described in "Complexity ranks" section](#complexity-ranks).

package.json

```json
{
  "devDependencies": {
    "typescript": "latest",
    "@typescript-eslint/parser": "latest",
    "@typescript-eslint/eslint-plugin": "latest"
  }
}
```

.eslintrc.json

```json
{
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "parser": "@typescript-eslint/parser",
      "plugins": [
        "@typescript-eslint"
      ],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
      ]
    }
  ]
}
```

## Complexity ranks

Every function and block will be ranked from A (best complexity score) to F (worst one).
This ranks is based on the ranks of complexity of the [Python Radon][radon_cc_rank].

**Rank	Risk**

-   **A**	low - simple block
-   **B**	low - well structured and stable block
-   **C**	moderate - slightly complex block
-   **D**	more than moderate - more complex block
-   **E**	high - complex block, alarming
-   **F**	very high - error-prone, unstable block

Ranks corresponds to rule complexity scores as follows:

| Rules                                                       | A      | B        | C         | D         | E         | F     |
| ----------------------------------------------------------- | ------ | -------- | --------- | --------- | --------- | ----- |
| Logic:                                                      |        |          |           |           |           |       |
| [**complexity**][eslint_rule]                               | 1 - 5  | 6 - 10   | 11 - 20   | 21 - 30   | 31 - 40   | 41 +  |
| [**max-depth**][eslint_max_depth]                           | 1 - 2  | 3        | 4 - 5     | 6 - 7     | 8         | 9 +   |
| [**max-nested-callbacks**][eslint_max_nested_callbacks]     | 1 - 3  | 4 - 5    | 6 - 10    | 11 - 15   | 16 - 20   | 21 +  |
| [**max-params**][eslint_max_params]                         | 1      | 2        | 3 - 4     | 5         | 6         | 7 +   |
| Raw:                                                        |        |          |           |           |           |       |
| [**max-lines**][eslint_max_lines]                           | 1 - 75 | 76 - 150 | 151 - 300 | 301 - 450 | 451 - 600 | 601 + |
| [**max-lines-per-function**][eslint_max_lines_per_function] | 1 - 13 | 14 - 25  | 26 - 50   | 51 - 75   | 76 - 100  | 101 + |
| [**max-statements**][eslint_max_statements]                 | 1 - 3  | 4 - 5    | 6 - 10    | 11 - 15   | 16 - 20   | 21 +  |

> **Note:** For rank "C", the maximum score, using from the standard score of ESLint rules.
>   See [complexity rules][eslint_rule].
>   Other rules are calculated relative to the values of the "complexity" rule.
>
> Example formula:
>   `[5, 10, 20, 30, 40].map(score => Math.round((score / 20) * defaultRuleScoreLimit))`

## Command line options

Command line format:

    $ eslintcc [options] file.js [file.js] [dir]

| Option                                         | Type             | Description                                                              |
| ---------------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| --rules &lt;rules>, -r=&lt;rules>              | Array of String  | Rule, or group: all, logic, raw. Default: logic                          |
| --format &lt;format>, -f=&lt;format>           | String           | Use a specific output format, text or json. Default: text                |
| --average, -a                                  | Flag             | Show the average complexity at the end of output, if used text format    |
| --show-rules, -sr                              | Flag             | Show rule name and value, if used text format                            |
| --greater-than &lt;value>, -gt=&lt;value>      | String or Number | Will show rules more than rank a, b, c, d, e, or rank value              |
| --less-than &lt;value>, -lt=&lt;value>         | String or Number | Will show rules less than rank b, c, d, e, f, or rank value              |
| --no-inline-config, -nlc                       | Flag             | Disable the use of configuration comments (such as `/*eslint-disable*/`) |
| --max-rank &lt;value>, -mr=&lt;value>          | String or Number | Maximum allowed complexity rank for a single message. Default: C         |
| --max-average-rank &lt;value>, -mar=&lt;value> | String or Number | Maximum allowed complexity rank for average value. Default: B            |

> If the rank value for one message or the average value is higher than the allowed value, the program terminates with error code 1

### Command examples

Output as JSON and show rules more than rank **E**:

    $ npx eslintcc -f=json -gt=e file.js

Use only 2 rules and show rule name:

    $ npx eslintcc --rules complexity --rules max-depth --show-rules file.js

### Output examples

> Based on the test files from the directory: [./test/src/](./test/src/)

      $ npx eslintcc --show-rules ./test/src/complexity__max_rank.js
      B test/src/complexity__max_rank.js
        D  3:0 function MyFunc (max-params = 4)
        A  9:0 function MyFunc1 (max-params = 1)
        A 15:0 function MyFunc2 (max-params = 1)
        A 21:0 function MyFunc3 (max-params = 1)
        B 27:0 function myFunc4 (max-params = 2)
        A 28:2 function myFunc4, IfStatement (28:2-32:3) (max-depth = 1)
        A 29:7 function myFunc4, arrow function (29:7-31:5) (max-nested-callbacks = 1)
      Error: Complexity of code above maximum allowable rank C (3), messages - 1


      $ npx eslintcc --format json ./test/src/complexity__max_average_rank.js
      {"files":[{"file":"/development/github/eslintcc/test/src/complexity__max_average_rank.js","messages":[{"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":1}},"type":"function","name":"function MyFunc","rules":{"max-params":{"value":3,"rank":3,"label":"C"},"complexity":{"value":1,"rank":0.2,"label":"A"}},"maxRule":"max-params"}],"average":{"rank":3,"label":"C"}}],"average":{"rank":3,"label":"C"},"ranks":{"A":0,"B":0,"C":1,"D":0,"E":0,"F":0},"errors":{"maxRank":0,"maxAverageRank":true}}


      $ npx eslintcc --show-rules ./test/src/custom_parser/typescript-eslint-parser.ts
      A test/src/custom_parser/typescript-eslint-parser.ts
        A 6:7 function test (max-params = 1)
        A 7:2 function test, IfStatement (7:2-11:3) (max-depth = 1)

[npm_img]: https://img.shields.io/npm/v/eslintcc.svg

[npm_url]: https://www.npmjs.com/package/eslintcc

[build_img]: https://travis-ci.com/eslintcc/eslintcc.svg?branch=master

[build_url]: https://travis-ci.com/eslintcc/eslintcc

[coverage_img]: https://coveralls.io/repos/github/eslintcc/eslintcc/badge.svg?branch=master

[coverage_url]: https://coveralls.io/github/eslintcc/eslintcc?branch=master

[eslint_npm]: https://www.npmjs.com/package/eslint

[eslint_rule]: https://eslint.org/docs/rules/complexity

[eslint_max_depth]: https://eslint.org/docs/rules/max-depth

[eslint_max_lines]: https://eslint.org/docs/rules/max-lines

[eslint_max_lines_per_function]: https://eslint.org/docs/rules/max-lines-per-function

[eslint_max_nested_callbacks]: https://eslint.org/docs/rules/max-nested-callbacks

[eslint_max_params]: https://eslint.org/docs/rules/max-params

[eslint_max_statements]: https://eslint.org/docs/rules/max-statements

[eslint_usage]: https://github.com/eslint/eslint#installation-and-usage

[eslint_config]: https://eslint.org/docs/user-guide/configuring/

[eslint_parser_options]: https://eslint.org/docs/user-guide/configuring/language-options#specifying-parser-options

[eslint_parser]: https://eslint.org/docs/user-guide/configuring/plugins#specifying-parser

[eslint_disabling_comments]: https://eslint.org/docs/user-guide/configuring/rules#disabling-rules

[radon_cc_rank]: https://radon.readthedocs.io/en/latest/api.html#radon.complexity.cc_rank
