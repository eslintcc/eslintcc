'use strict';

const EventEmitter = require('events');
const { ESLint, Linter } = require('eslint');

// Linter.prototype.verify = (originalVerify => function patchingLinterVerify(source, config, options) {
//   const messages = originalVerify.apply(this, [source, config, options]);

//   this.events.emit('verifyFile', options.filename, messages);

//   return messages;
// })(Linter.prototype.verify);


// Rules to patched
const esLintRules = new Linter().getRules();
const complexity = esLintRules.get('complexity');
const maxDepth = esLintRules.get('max-depth');
const maxLen = esLintRules.get('max-len');
const maxLines = esLintRules.get('max-lines');
const maxLinesPerFunction = esLintRules.get('max-lines-per-function');
const maxNestedCallbacks = esLintRules.get('max-nested-callbacks');
const maxParams = esLintRules.get('max-params');
const maxStatements = esLintRules.get('max-statements');


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
 * Extend the class "ESLint" introducing the logic of message interception and work with the event model
 */
class PatchedESLint extends ESLint {

  constructor(options) {
    super(options);
    this.events = new EventEmitter();

    // Redefine of validator to intercept the results of the validation rules
    // this._originalLinterVerify = slots.linter
    //   .verify.bind(slots.linter);
    // slots.linter.verify = this._patchingLinterVerify.bind(this);
  }



  _patchingLinterVerify(source, config, options) {
    const messages = this._originalLinterVerify(source, config, options);
    this.events.emit('verifyFile', options.filename, messages);
    return messages;
  }

}


exports.patchingESLint = patchingESLint;
exports.PatchedESLint = PatchedESLint;
