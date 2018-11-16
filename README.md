# ESLint Cyclomatic Complexity Tool [![npm][npm_img]][npm_url]

[ESLintCC][npm_url] is a ECMAScript/JavaScript tool
  that computes cyclomatic complexity by using [ESLint][eslint_npm]

> ESLint calculates cyclomatic complexity,
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

Integration in JavaScript application:

```js
const { Complexity } = require('eslintcc');

const complexity = new Complexity();
const report = complexity.executeOnFiles(['yourfile.js']);

console.log(JSON.stringify(report, null, '\t'));
```

**Note:** ESLintCC ignores all plugins, shareable configs and rules, specified in configuration files,
    and uses to generate a report only [complexity rules][eslint_rule].
  So there is no need to install these dependencies for use ESLintCC.

## Configuration

ESLintCC uses ESLint along with [Its configuration system][eslint_config].
You can use configuration comments and files, as described in the configuration for ESLint.

**Features:**

1.  You can configurate [parserOptions][eslint_parser_options]
    and [parser][eslint_parser] for specify the JavaScript language support. `.eslintrc.json`:

```json
{
  "parserOptions": {
    "ecmaVersion": 2017
  }
}
```

2.  You can disable checks for a specific complexity rule for a single file using a comment:

```js
/* eslint max-params: off, max-depth: off */

function myFunc(a, b, c, d, e) {
  //...
}
```

* * *

**...while in development... :relaxed:**

[npm_img]: https://img.shields.io/npm/v/eslintcc.svg

[npm_url]: https://www.npmjs.com/package/eslintcc

[eslint_npm]: https://www.npmjs.com/package/eslint

[eslint_rule]: https://eslint.org/docs/rules/complexity

[eslint_usage]: https://github.com/eslint/eslint#installation-and-usage

[eslint_config]: https://eslint.org/docs/user-guide/configuring

[eslint_parser_options]: https://eslint.org/docs/user-guide/configuring#specifying-parser-options

[eslint_parser]: https://eslint.org/docs/user-guide/configuring#specifying-parser
