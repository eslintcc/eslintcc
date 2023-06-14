const { equal, deepEqual, throws, doesNotThrow, ok } = require('assert').strict
const { execSync, spawnSync } = require('child_process')
const { sep, resolve } = require('path')
const { Test } = require('../build/@nodutilus-test')


class TestCLI extends Test {

  get name() {
    return 'cli'
  }

  ['test: help']() {
    const helpMod = require('../source/lib/help')

    const helpStr = execSync('node source/cli.js', { encoding: 'utf-8' })

    equal(helpMod.trim(), helpStr.trim())
  }

  ['test: greaterThan + lessThan + showRules']() {
    const cmd = 'node source/cli.js test/src/complexity__messages_gtlt.js --gt A --lt F --sr -mr=f -mar=f'
    const report = execSync(cmd, { encoding: 'utf-8' })

    equal(`\x1b[33;1mD\x1b[0m test${sep}src${sep}complexity__messages_gtlt.js\n` +
      '  \x1b[32;1mB\x1b[0m  9:0 function myFunc2 (max-params = 2)\n' +
      '  \x1b[33;1mC\x1b[0m 15:0 function myFunc3 (max-params = 3)', report.trim())
  }

  ['test: greaterThan + lessThan + json']() {
    const child = spawnSync('node', [
      'source/cli.js',
      'test/src/complexity__messages_gtlt.js',
      '--gt', 'B',
      '--lt', 'F',
      '--format', 'json'
    ], { encoding: 'utf-8', shell: true })

    equal(1, child.status)

    const report = JSON.parse(child.stdout)

    deepEqual({
      average: { rank: 3.406, label: 'D' },
      errors: {
        maxAverageRank: true,
        maxRank: 2
      },
      ranks: {
        A: 1,
        B: 1,
        C: 1,
        D: 0,
        E: 0,
        F: 2
      },
      files: [{
        average: { rank: 3.406, label: 'D' },
        file: resolve('test/src/complexity__messages_gtlt.js'),
        messages: [{
          type: 'function',
          loc: { start: { line: 15, column: 0 }, end: { line: 17, column: 1 } },
          name: 'function myFunc3',
          rules: {
            'max-params': { value: 3, rank: 3, label: 'C' },
            'complexity': { value: 1, rank: 0.2, label: 'A' }
          },
          maxRule: 'max-params'
        }]
      }]
    }, report)
  }

  ['test: json + rules']() {
    const child1 = spawnSync('node', [
      'source/cli.js',
      'test/src/complexity__one_rule.js',
      '--format', 'json'
    ], { encoding: 'utf-8', shell: true })

    equal(1, child1.status)

    const report1 = JSON.parse(child1.stdout)

    deepEqual({
      average: { rank: 5.166, label: 'F' },
      errors: {
        maxAverageRank: true,
        maxRank: 1
      },
      ranks: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 1
      },
      files: [{
        average: { rank: 5.166, label: 'F' },
        file: resolve('test/src/complexity__one_rule.js'),
        messages: [{
          type: 'function',
          loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 1 } },
          name: 'function myFunc',
          rules: {
            'max-params': { value: 7, rank: 5.166, label: 'F' },
            'complexity': { value: 1, rank: 0.2, label: 'A' }
          },
          maxRule: 'max-params'
        }]
      }]
    }, report1)

    const child2 = spawnSync('node', [
      'source/cli.js',
      'test/src/complexity__one_rule.js',
      '--format', 'json',
      '--rules', 'complexity'
    ], { encoding: 'utf-8', shell: true })

    equal(0, child2.status)

    const report2 = JSON.parse(child2.stdout)

    deepEqual({
      average: { rank: 0.2, label: 'A' },
      errors: {
        maxAverageRank: false,
        maxRank: 0
      },
      ranks: {
        A: 1,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0
      },
      files: [{
        average: { rank: 0.2, label: 'A' },
        file: resolve('test/src/complexity__one_rule.js'),
        messages: [{
          type: 'function',
          loc: { start: { line: 3, column: 0 }, end: { line: 5, column: 1 } },
          name: 'function myFunc',
          rules: {
            complexity: { value: 1, rank: 0.2, label: 'A' }
          },
          maxRule: 'complexity'
        }]
      }]
    }, report2)
  }

  ['test: json + 2-rules']() {
    const args1 = ['source/cli.js', 'test/src/complexity__one_rule.js', '--format', 'json']
    const args2 = args1.concat('--rules', 'logic', '--rules', 'max-statements')
    const child1 = spawnSync('node', args1, { encoding: 'utf-8', shell: true })

    equal(1, child1.status)

    const report1 = JSON.parse(child1.stdout)
      .files[0].messages[0].rules

    deepEqual({
      'max-params': { value: 7, rank: 5.166, label: 'F' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, report1)

    const child2 = spawnSync('node', args2, { encoding: 'utf-8', shell: true })
    const report2 = JSON.parse(child2.stdout)
      .files[0].messages[0].rules

    equal(1, child2.status)
    deepEqual({
      'complexity': { value: 1, rank: 0.2, label: 'A' },
      'max-params': { value: 7, rank: 5.166, label: 'F' },
      'max-statements': { value: 1, rank: 0.333, label: 'A' }
    }, report2)
  }

  ['test: --no-inline-config']() {
    const args1 = ['source/cli.js', 'test/src/complexity__inline_config_for_file.js', '--format', 'json']
    const args2 = args1.concat('--no-inline-config')
    const child1 = spawnSync('node', args1, { encoding: 'utf-8', shell: true })

    equal(0, child1.status)

    const messages1 = JSON.parse(child1.stdout).files[0].messages

    equal(0, messages1.length)

    const child2 = spawnSync('node', args2, { encoding: 'utf-8', shell: true })

    equal(1, child2.status)

    const messages2 = JSON.parse(child2.stdout).files[0].messages

    equal(1, messages2.length)

    const args3 = ['source/cli.js', 'test/src/complexity__inline_config.js', '--format', 'json']
    const child3 = spawnSync('node', args3, { encoding: 'utf-8', shell: true })

    equal(1, child3.status)

    const messages3 = JSON.parse(child3.stdout).files[0].messages

    equal(2, messages3.length)
    deepEqual({
      complexity: { value: 1, rank: 0.2, label: 'A' }
    }, messages3[0].rules)
    deepEqual({
      'max-params': { value: 13, rank: 6.166, label: 'F' },
      'complexity': { value: 1, rank: 0.2, label: 'A' }
    }, messages3[1].rules)

    const args4 = args3.concat('--no-inline-config')
    const child4 = spawnSync('node', args4, { encoding: 'utf-8', shell: true })

    equal(1, child3.status)

    const messages4 = JSON.parse(child4.stdout).files[0].messages

    equal(4, messages4.length)
  }

  ['test: exitWithError']() {
    const cmd = 'node source/cli.js test/src/cli__exit_with_error.js'

    throws(() => {
      execSync(cmd, { encoding: 'utf-8', stdio: 'ignore' })
    })
  }

  ['test: exitWithError -mr=f -mar=f']() {
    const cmd = 'node source/cli.js -mr=f -mar=f test/src/cli__exit_with_error.js'

    doesNotThrow(() => {
      execSync(cmd, { encoding: 'utf-8', stdio: 'ignore' })
    })
  }

  ['test: exitWithError -mr=f -mar=f (parse Error: Fatal)']() {
    const cmd = 'node source/cli.js -mr=f -mar=f test/src/complexity__fatal.js'

    throws(() => {
      execSync(cmd, { encoding: 'utf-8', stdio: 'ignore' })
    })
  }

  ['test: exitWithError - stdout/stderr']() {
    const child = spawnSync('node', ['source/cli.js', '-mr=f', '-mar=f', 'test/src/complexity__fatal.js'], {
      encoding: 'utf-8',
      shell: true
    })

    equal(1, child.status)

    const stdout = `\u001b[31;1mF\u001b[0m test${sep}src${sep}complexity__fatal.js` +
      '\n  \u001b[31;1mF\u001b[0m 4:3 Program (4:3-4:3)' +
      '\n    \u001b[31;1mError\u001b[0m Parsing error: The keyword \'let\' is reserved\n'

    equal(stdout, child.stdout)

    const stderr = '\u001b[31;1mError\u001b[0m: Complexity of code above maximum allowable rank ' +
      '\u001b[31;1mF\u001b[0m (Infinity), messages - 1\n'

    equal(stderr, child.stderr)
  }

  ['test: exitWithError - complexity.lintFiles']() {
    const child = spawnSync('node', ['source/cli.js', '"@!#$%^&*"'], {
      encoding: 'utf-8',
      shell: true
    })

    ok(child.stdout.startsWith("NoFilesFoundError: No files matching '@!#$%^&*' were found."))
  }


}


module.exports = TestCLI
