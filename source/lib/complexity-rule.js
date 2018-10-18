'use strict';

const complexity = require('eslint/lib/rules/complexity');

/**
 * ESLint does not return additional data, for analyzing cyclomatic complexity, defined by the rule.
 *  To make them easier to analyze, we will redefine the message in JSON format,
 *  and then it will parse in "Complexity" class.
 */
function patchComplexityRule() {
  complexity.meta.messages.complex = JSON.stringify({
    name: '{{name}}',
    complexity: '{{complexity}}',
    ruleMessage: complexity.meta.messages.complex
  });
}


exports.patchComplexityRule = patchComplexityRule;
