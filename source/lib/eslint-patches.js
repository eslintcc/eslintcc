'use strict';

const EventEmitter = require('events');

const { CLIEngine } = require('eslint');
const { getCLIEngineInternalSlots } = require('eslint/lib/cli-engine/cli-engine');

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
 * Clear rules option.
 * Since we only need complexity rules,
 *  we need to clear extra rules from the configuration
 */
function __purifyConfig(config) {
  const { name } = config;
  if (name !== 'CLIOptions') {
    delete config.rules;
  }
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
  __patchComplexityRules();
}


/**
 * Extend the class "CLIEngine" introducing the logic of message interception and work with the event model
 */
class PatchedCLIEngine extends CLIEngine {

  constructor(options) {
    super(options);
    this.events = new EventEmitter();
    const slots = getCLIEngineInternalSlots(this);
    // Redefine of validator to intercept the results of the validation rules
    this._originalGetConfigArrayForFile = slots.configArrayFactory
      .getConfigArrayForFile.bind(slots.configArrayFactory);
    slots.configArrayFactory.getConfigArrayForFile = this._getConfigArrayForFile.bind(this);
    // Redefine of config-loader to clear extra rules from configuration file
    this._originalLinterVerify = slots.linter
      .verify.bind(slots.linter);
    slots.linter.verify = this._patchingLinterVerify.bind(this);
  }

  _getConfigArrayForFile(...args) {
    const configArray = this._originalGetConfigArrayForFile(...args);
    for (const config of configArray) {
      __purifyConfig(config);
    }
    return configArray;
  }

  _patchingLinterVerify(source, config, options) {
    const messages = this._originalLinterVerify(source, config, options);
    this.events.emit('verifyFile', options.filename, messages);
    return messages;
  }

}


exports.patchingESLint = patchingESLint;
exports.PatchedCLIEngine = PatchedCLIEngine;
