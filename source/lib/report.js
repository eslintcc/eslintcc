/* eslint-disable prefer-destructuring */
const { Ranks } = require('./rank')

const functionNodeTypes = ['FunctionExpression', 'FunctionDeclaration']
const nodeTypesNames = {
  ArrowFunctionExpression: 'arrow function'
}
const ruleTypes = {
  'complexity': 'function',
  'max-depth': 'block',
  // 'max-len': 'line',
  'max-lines': 'file',
  'max-lines-per-function': 'function',
  'max-nested-callbacks': 'function',
  'max-params': 'function',
  'max-statements': 'function'
}
const messagesMapSymbol = Symbol('messagesMapSymbol')
const nodeSymbol = Symbol('nodeSymbol')
const maxSymbol = Symbol('maxSymbol')
const fatalSymbol = Symbol('fatalSymbol')


class MessageNode {

  constructor(node) {
    this.node = node
  }

  get position() {
    const { start, end } = this.node.loc

    return `${start.line}:${start.column}-${end.line}:${end.column}`
  }

  getFunctionName() {
    const { node } = this

    if (node.id) {
      return `function ${node.id.name}`
    } else {
      const { parent } = node

      switch (parent.type) {
        case 'MethodDefinition':
          if (parent.parent.parent.id) {
            return 'class ' + parent.parent.parent.id.name +
              (parent.static ? '.' : '#') +
              (parent.key.name || parent.key.raw)
          }

          return 'class <anonymous>' +
            (parent.static ? '.' : '#') +
            (parent.key.name || parent.key.raw)
        case 'Property':
          return `function ${parent.key.name || parent.key.raw}`
        case 'VariableDeclarator':
          return `function ${parent.id.name}`
        default:
          return `function <anonymous> (${this.position})`
      }
    }
  }

  getNameInParentFunction() {
    const { node } = this
    let name = `${nodeTypesNames[node.type] || node.type} (${this.position})`
    let { parent } = node

    while (parent) {
      if (functionNodeTypes.includes(parent.type)) {
        // @ts-ignore
        name = new this.constructor(parent).getFunctionName() + ', ' + name
        break
      }
      parent = parent.parent
    }

    return name
  }

  getName() {
    const { node } = this

    if (functionNodeTypes.includes(node.type)) {
      return this.getFunctionName()
    } else {
      return this.getNameInParentFunction()
    }
  }

}


class MessageReport {

  constructor({ ruleType, node }) {
    this[nodeSymbol] = new MessageNode(node)
    this[maxSymbol] = { rank: 0 }
    this.loc = node.loc
    this.type = ruleType
    this.name = this[nodeSymbol].getName()
    this.rules = {}
    this.maxRule = null
  }

}


class FileReport {

  constructor(file) {
    this[messagesMapSymbol] = new Map()
    this.file = file
    this.messages = []
    this.average = { rank: 0 }
  }

}


class ComplexityReport {

  constructor() {
    this.files = []
    this.average = { rank: 0 }
    this.ranks = Ranks.createRanksCounters()
    this.errors = {
      maxRank: 0,
      maxAverageRank: false
    }
  }

}


class ReportGenerator {

  static ['resolveValue:complexity'](data) {
    return data.complexity
  }

  static ['resolveValue:max-depth'](data) {
    return data.depth
  }

  static ['resolveValue:max-lines'](data) {
    return data.actual
  }

  static ['resolveValue:max-lines-per-function'](data) {
    return data.lineCount
  }

  static ['resolveValue:max-nested-callbacks'](data) {
    return data.num
  }

  static ['resolveValue:max-params'](data) {
    return data.count
  }

  static ['resolveValue:max-statements'](data) {
    return data.count
  }

  static pushNewMessage(fileReport, { ruleType, node }) {
    const message = new MessageReport({ ruleType, node })

    fileReport[messagesMapSymbol].set(node, message)
    fileReport.messages.push(message)

    return message
  }

  constructor({ ranks, greaterThan, lessThan, maxRank, maxAverageRank }) {
    this.options = { ranks, greaterThan, lessThan, maxRank, maxAverageRank }
    this.report = new ComplexityReport()
  }

  pushMessage(fileReport, { ruleId, ruleType, node, data }) {
    node = node || {
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      type: 'Program',
      parent: null
    }

    const reportMessage = fileReport[messagesMapSymbol].get(node) ||
      // @ts-ignore
      this.constructor.pushNewMessage(fileReport, { ruleType, node })
    const value = this.constructor[`resolveValue:${ruleId}`](data)
    const { rank, label } = this.options.ranks.getValue(ruleId, value)

    reportMessage.rules[ruleId] = { value, rank, label }
    if (rank > reportMessage[maxSymbol].rank) {
      reportMessage.maxRule = ruleId
      reportMessage[maxSymbol] = reportMessage.rules[ruleId]
    }
  }

  pushFatalMessage(fileReport, { ruleId, ruleType, line, column, message }) {
    const loc = { start: { line, column }, end: { line, column } }
    const node = { loc, type: 'Program', parent: null }
    // @ts-ignore
    const reportMessage = this.constructor.pushNewMessage(fileReport, { ruleType, node })
    // @ts-ignore
    const { rank, label } = this.options.ranks.constructor.getMaxValue()

    reportMessage.maxRule = ruleId
    reportMessage.error = message
    reportMessage[maxSymbol] = reportMessage.rules[ruleId] = { value: 1, rank, label }
    reportMessage[fatalSymbol] = true
  }

  verifyFile(file, messages) {
    const { report } = this
    const fileReport = new FileReport(file)

    messages.forEach(message => {
      if (message.fatal) {
        message.ruleId = 'fatal-error'
        message.ruleType = 'file'
        this.pushFatalMessage(fileReport, message)
      } else if (message.ruleId in ruleTypes) {
        message = message.message
        message.ruleType = ruleTypes[message.ruleId]
        this.pushMessage(fileReport, message)
      }
    })

    const messagesLength = fileReport.messages.length
    const { greaterThan, lessThan } = this.options

    if (typeof greaterThan === 'number' || typeof lessThan === 'number') {
      const gt = typeof greaterThan === 'number' ? greaterThan : -Infinity
      const lt = typeof lessThan === 'number' ? lessThan : Infinity

      fileReport.messages = fileReport.messages.filter(message => {
        const { rank, label } = message[maxSymbol]

        fileReport.average.rank += rank
        report.ranks[label]++
        if (rank > this.options.maxRank || message[fatalSymbol]) {
          report.errors.maxRank++
        }
        if (message[fatalSymbol]) {
          return true
        }
        if (rank <= gt) {
          fileReport[messagesMapSymbol].delete(message[nodeSymbol].node)

          return false
        }
        if (rank > lt) {
          fileReport[messagesMapSymbol].delete(message[nodeSymbol].node)

          return false
        }

        return true
      })
    } else {
      fileReport.messages.forEach(message => {
        const { rank, label } = message[maxSymbol]

        fileReport.average.rank += rank
        report.ranks[label]++
        if (rank > this.options.maxRank || message[fatalSymbol]) {
          report.errors.maxRank++
        }
      })
    }
    fileReport.average.rank = Ranks.roundValue(fileReport.average.rank / messagesLength)
    fileReport.average.label = Ranks.getLabelByValue(fileReport.average.rank)
    report.average.rank += fileReport.average.rank
    report.files.push(fileReport)

    return fileReport
  }

  finish() {
    const { report } = this
    const { average } = report

    average.rank = Ranks.roundValue(average.rank / report.files.length)
    average.label = Ranks.getLabelByValue(average.rank)
    if (average.rank > this.options.maxAverageRank) {
      report.errors.maxAverageRank = true
    }
  }

}


exports.messagesMapSymbol = messagesMapSymbol
exports.nodeSymbol = nodeSymbol
exports.maxSymbol = maxSymbol
exports.fatalSymbol = fatalSymbol
exports.ReportGenerator = ReportGenerator
