'use strict';

const EventEmitter = require('events');

const { CLIEngine } = require('eslint');
const { createEmptyConfig } = require('eslint/lib/config/config-ops');

// Config validator to patched config object
const validator = require('eslint/lib/config/config-validator');

// Rules to patched
const complexity = require('eslint/lib/rules/complexity');
const maxDepth = require('eslint/lib/rules/max-depth');
const maxLen = require('eslint/lib/rules/max-len');
const maxLines = require('eslint/lib/rules/max-lines');
const maxLinesPerFunction = require('eslint/lib/rules/max-lines-per-function');
const maxNestedCallbacks = require('eslint/lib/rules/max-nested-callbacks');
const maxParams = require('eslint/lib/rules/max-params');
const maxStatements = require('eslint/lib/rules/max-statements');

/**
 * Valid rules and rule values for the configuration file,
 *  since through the configuration file, you can only disable the rules.
 * Otherwise, you need to disable the rules locally in a source code file.
 */
const validRrules = [
  'complexity',
  'max-depth',
  'max-len',
  'max-lines',
  'max-lines-per-function',
  'max-nested-callbacks',
  'max-params',
  'max-statements'
];
const validRruleValues = ['off', 0];


/**
 * Clear all options that affect the rules
 */
function __purifyConfig(config) {
  const empty = createEmptyConfig();
  config.globals = empty.globals;
  config.env = empty.env;
  const rules = config.rules;
  config.rules = empty.rules;
  for (const rule in rules) {
    if (validRrules.includes(rule) && validRruleValues.includes(rules[rule])) {
      config.rules[rule] = rules[rule];
    }
  }
  config.extends = empty.config;
  config.plugins = empty.plugins;
  config.overrides = empty.overrides;
  return config;
}


/**
 * To implement the hook, the rule validation function is used,
 *  because you must remove "extends" and other rules options before calling the "applyExtends" function.
 *
 * Why hook: In ESLint there is no possibility to legally loading the options of parsing the source code
 *  with the support of the hierarchy of configuration files.
 * And without options of parsing, the complexity analysis will not work.
 *
 * Reason: Using the "rules", "plugins" and "extends" options from the analyzed project
 *  will lead to the fact that there are errors when loading the dependency modules
 *  that are not installed locally for "eslintcc".
 */
function __purifyESLintConfigRules() {
  const originValidate = validator.validate.bind(validator);
  validator.validate = (config, ...args) => originValidate(__purifyConfig(config), ...args);
}


/**
 * Allows you to override the properties of the object on which the method is applied "Object.freeze".
 * Used to intercept messages in a method "context.report" inside a "Linter" and "rule.create",
 *  which are defined in depth of ESLint logic
 */
function __antifreeze(frozen, properties) {
  return new Proxy(properties, {
    get(properties, name) {
      return properties[name] || frozen[name];
    }
  });
}


/**
 * ESLint does not return additional data, for analyzing messages, defined by the rules.
 * To simplify their analysis, we'll override the message handler to get the message as an object.
 */
function __patchComplexityRule(rule) {
  rule.create = ((originalCreate) => (context) => {
    return originalCreate(__antifreeze(context, {
      report(message) {
        message.message = {
          ruleId: context.id,
          node: message.node,
          data: message.data
        };
        message.data = null;
        message.messageId = null;
        return context.report(message);
      }
    }));
  })(rule.create.bind(rule));
}


/**
 * Run all ESLint complexity rules patches
 */
function __patchComplexityRules() {
  __patchComplexityRule(complexity);
  __patchComplexityRule(maxDepth);
  __patchComplexityRule(maxLen);
  __patchComplexityRule(maxLines);
  __patchComplexityRule(maxLinesPerFunction);
  __patchComplexityRule(maxNestedCallbacks);
  __patchComplexityRule(maxParams);
  __patchComplexityRule(maxStatements);
}


/**
 * Run all ESLint behavior patches
 */
function patchingESLint() {
  __purifyESLintConfigRules();
  __patchComplexityRules();
}


/**
 * Extend the class "CLIEngine" introducing the logic of message interception and work with the event model
 */
class PatchedCLIEngine extends CLIEngine {

  constructor(options) {
    super(options);
    this.events = new EventEmitter();
    this.originalLinterVerify = this.linter.verify.bind(this.linter);
    this.linter.verify = this.patchingLinterVerify.bind(this);
  }

  patchingLinterVerify(source, config, options) {
    const messages = this.originalLinterVerify(source, config, options);
    this.events.emit('verifyFile', options.filename, messages);
    return messages;
  }

  destroy() {
    delete this.linter.verify;
    delete this.originalLinterVerify;
  }

}


exports.patchingESLint = patchingESLint;
exports.PatchedCLIEngine = PatchedCLIEngine;
