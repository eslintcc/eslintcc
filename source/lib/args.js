function __escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


class CLArguments {

  /**
   * @name CLArguments.prefixPattern
   * @type {RegExp}
   * @default
   */
  static get prefixPattern() {
    return /^--?/
  }

  /**
   * @name CLArguments.flagPrefix
   * @type {string}
   * @default
   */
  static get flagPrefix() {
    return '-'
  }

  /**
   * @name CLArguments.optionPrefix
   * @type {string}
   * @default
   */
  static get optionPrefix() {
    return '--'
  }

  /**
   * @function CLArguments.resolvePrefixPattern
   * @param {string} [flagPrefix]
   * @param {string} [optionPrefix]
   * @returns {RegExp}
   */
  static resolvePrefixPattern(flagPrefix, optionPrefix) {
    if (flagPrefix || optionPrefix) {
      flagPrefix = __escapeRegExp(flagPrefix || this.flagPrefix)
      optionPrefix = __escapeRegExp(optionPrefix || this.optionPrefix)
      if (flagPrefix.length < optionPrefix.length) {
        return new RegExp(`^${optionPrefix}|^${flagPrefix}`)
      } else {
        return new RegExp(`^${flagPrefix}|^${optionPrefix}`)
      }
    } else {
      return this.prefixPattern
    }
  }

  /**
   * @name CLArguments.setterPattern
   * @type {RegExp}
   * @default
   */
  static get setterPattern() {
    return /=/
  }

  /**
   * @name CLArguments.setter
   * @type {string}
   * @default
   */
  static get setter() {
    return '='
  }

  /**
   * @function CLArguments.resolveSetterPattern
   * @param {string} [setter]
   * @returns {RegExp}
   */
  static resolveSetterPattern(setter) {
    if (setter) {
      return new RegExp(__escapeRegExp(setter))
    } else {
      return this.setterPattern
    }
  }

  /**
   * @typedef CLArgumentsOptions
   * @property {RegExp} [prefixPattern=CLArguments.prefixPattern]
   * @property {string} [flagPrefix=CLArguments.flagPrefix]
   * @property {string} [optionPrefix=CLArguments.optionPrefix]
   * @property {RegExp} [setterPattern=CLArguments.setterPattern]
   * @property {string} [setter=CLArguments.setter]
   * @property {{[x: string]: string}} [types={}]
   * @property {{[x: string]: string|string[]}} [aliases={}]
   */
  /**
   * @function CLArguments.resolveCLAOptions
   * @param {CLArgumentsOptions} claOptions
   * @returns {CLArgumentsOptions}
   */
  static resolveCLAOptions(claOptions = {}) {
    claOptions.prefixPattern = claOptions.prefixPattern || this.resolvePrefixPattern(
      claOptions.flagPrefix,
      claOptions.optionPrefix
    )
    claOptions.flagPrefix = claOptions.flagPrefix || this.flagPrefix
    claOptions.optionPrefix = claOptions.optionPrefix || this.optionPrefix
    claOptions.setterPattern = claOptions.setterPattern || this.resolveSetterPattern(
      claOptions.setter
    )
    claOptions.setter = claOptions.setter || this.setter
    claOptions.types = claOptions.types || {}
    claOptions.aliases = claOptions.aliases || {}

    return claOptions
  }

  /**
   * @function CLArguments.resolveArgumentName
   * @param {string} name
   * @param {{[x: string]: string|string[]}} aliases
   * @returns {string}
   */
  static resolveArgumentName(name, aliases) {
    if (aliases) {
      for (const [realName, alias] of Object.entries(aliases)) {
        if (name === alias || (alias instanceof Array && ~alias.indexOf(name))) {
          return realName
        }
      }
    }

    return name
  }

  /**
   * @typedef CLSolvedArgument
   * @property {string} [name]
   * @property {string} value
   * @property {string} [type]
   * @property {boolean} [offset]
   */
  /**
   * @function CLArguments.resolveArgumentType
   * @param {CLSolvedArgument} solvedArgument
   * @param {{[x: string]: string}} types
   * @returns {string}
   */
  static resolveArgumentType({ name, value }, types = {}) {
    let type = types[name]

    if (!type) {
      if (name && value) {
        type = 'Option'
      } else if (name) {
        type = 'Flag'
      } else {
        type = 'Argument'
      }
    }

    return type
  }

  /**
   * @function CLArguments.resolveArgument
   * @param {string} testName
   * @param {string} [testValue]
   * @param {CLArgumentsOptions} [claOptions]
   * @returns {CLSolvedArgument}
   */
  static resolveArgument(testName, testValue, claOptions) {
    const { prefixPattern, setterPattern, aliases, types } = this.resolveCLAOptions(claOptions)
    const result = {}

    if (prefixPattern.test(testName)) {
      const name = testName.replace(prefixPattern, '')

      if (setterPattern.test(name)) {
        const setter = name.replace(setterPattern, ' ').split(' ')

        result.name = this.resolveArgumentName(setter[0], aliases)
        /* eslint-disable prefer-destructuring */
        result.value = setter[1]
        result.offset = false
      } else if (typeof testValue === 'undefined' || prefixPattern.test(testValue)) {
        result.name = this.resolveArgumentName(name, aliases)
      } else {
        result.name = this.resolveArgumentName(name, aliases)
        result.value = testValue
        result.offset = true
      }
    } else {
      result.value = testName
    }
    result.type = this.resolveArgumentType(result, types)

    return result
  }

  /**
   * @function CLArguments.setterTypeOption
   * @param {CLParsedArguments} parsedArguments
   * @param {CLSolvedArgument} solvedArgument
   */
  static setterTypeOption({ options }, { name, value }) {
    options[name] = value
  }

  /**
   * @function CLArguments.setterTypeArray
   * @param {CLParsedArguments} parsedArguments
   * @param {CLSolvedArgument} solvedArgument
   */
  static setterTypeArray({ options }, { name, value }) {
    if (name in options) {
      // @ts-ignore
      options[name].push(value)
    } else {
      options[name] = [value]
    }
  }

  /**
   * @function CLArguments.setterTypeFlag
   * @param {CLParsedArguments} parsedArguments
   * @param {CLSolvedArgument} solvedArgument
   */
  static setterTypeFlag({ flags, argv }, { name, value }) {
    flags[name] = true
    if (value) {
      this.setterTypeArgument({ argv }, { value })
    }
  }

  /**
   * @function CLArguments.setterTypeArgument
   * @param {CLParsedArguments} parsedArguments
   * @param {CLSolvedArgument} solvedArgument
   */
  static setterTypeArgument({ argv }, { value }) {
    argv.push(value)
  }

  /**
   * @typedef CLParsedArguments
   * @property {{[x: string]: boolean}} [flags]
   * @property {{[x: string]: string|string[]}} [options]
   * @property {Array<string>} [argv]
   */
  /**
   * @function CLArguments.parse
   * @param {string|Array<string>} [input]
   * @param {CLArgumentsOptions} [claOptions]
   * @returns {CLParsedArguments}
   */
  static parse(input = [], claOptions = {}) {
    const inputArgs = typeof input === 'string' ? input.split(' ').filter(Boolean) : input
    const parsed = { flags: {}, options: {}, argv: [] }

    for (let index = 0; index < inputArgs.length; index++) {
      const solvedArgument = this.resolveArgument(
        inputArgs[index], inputArgs[index + 1], claOptions
      )

      this['setterType' + solvedArgument.type](parsed, solvedArgument)
      if (solvedArgument.offset) {
        index++
      }
    }

    return parsed
  }

  /**
   * @function CLArguments.stringify
   * @param {CLParsedArguments} parsedArguments
   * @param {CLArgumentsOptions} claOptions
   * @returns {string}
   */
  static stringify(parsedArguments, claOptions) {
    const { flagPrefix, optionPrefix, setter } = this.resolveCLAOptions(claOptions)
    const argv = []

    if ('flags' in parsedArguments) {
      for (const [name] of Object.entries(parsedArguments.flags)) {
        argv.push(flagPrefix + name)
      }
    }
    if ('options' in parsedArguments) {
      for (const [name, value] of Object.entries(parsedArguments.options)) {
        argv.push(optionPrefix + name + setter + value)
      }
    }
    if ('argv' in parsedArguments) {
      argv.push(...parsedArguments.argv)
    }

    return argv.join(' ')
  }

  /**
   * @class CLArguments
   * @param {CLArgumentsOptions} claOptions
   * @property {CLArgumentsOptions} claOptions
   * @property {{[x: string]: boolean}} flags
   * @property {{[x: string]: string}} options
   * @property {Array<string>} argv
   */
  constructor(claOptions) {
    // @ts-ignore
    this.claOptions = this.constructor.resolveCLAOptions(claOptions)
  }

  /**
   * @function CLArguments#parse
   * @param {string|Array<string>} [input]
   * @returns {CLParsedArguments}
   */
  parse(input) {
    // @ts-ignore
    return Object.assign(this, this.constructor.parse(input, this.claOptions))
  }

  /**
   * @function CLArguments#stringify
   * @returns {string}
   */
  stringify() {
    // @ts-ignore
    return this.constructor.stringify(this, this.claOptions)
  }

}


/**
 * @function getProcessArgs
 * @param {CLArgumentsOptions} claOptions
 * @returns {CLParsedArguments}
 */
function getProcessArgs(claOptions) {
  return new CLArguments(claOptions).parse(process.argv.slice(2))
}


exports.CLArguments = CLArguments
exports.getProcessArgs = getProcessArgs
