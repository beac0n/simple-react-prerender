const chalk = require('chalk')
const console = require('better-console')

const yellowSign = chalk.yellow('\u26A0')
const redCross = chalk.red('\u2716')
const greenHook = chalk.green('\u2714')
const blueInfo = chalk.blue('\u2139')

const messageParseRegex = new RegExp('\n', 'g')
const parseMessage = (message = '', newLineReplacement = '') => typeof message === 'string'
    ? `${newLineReplacement} ${message.replace(messageParseRegex, `\n${newLineReplacement} `)}.`.trim()
    : ''


let isSilent = false
const setSilent = (silent) => isSilent = silent

const printTo = ['info', 'warn', 'error', 'log'].reduce((accumulator, consoleType) => {
    accumulator[consoleType] = (...args) => isSilent ? undefined : console[consoleType](...args)
    return accumulator
}, {})

printTo.write = (...args) => isSilent ? undefined : process.stdout.write(...args)

const info = (message = '') => printTo.info(chalk.white(parseMessage(message, blueInfo)))
const warn = (message = '') => printTo.warn(parseMessage(message, yellowSign))
const error = (message = '') => printTo.error(parseMessage(message, redCross))
const print = (message = '') => printTo.log(message.trim())
const printNoLineBreak = (message = '') => printTo.write(message.trim())

const success = (message = '') => print(chalk.green(`${message} ${greenHook}`))

const getPresentParticiple = (verb = '') => {
    if (verb.length <= 1) return verb

    let base = verb

    // http://www.gingersoftware.com/content/grammar-rules/verbs/the-present-progressive-tense/
    if (verb.endsWith('ie')) {
        base = verb.substring(0, verb.length - 2) + 'y'
    } else if (verb.endsWith('e')) {
        base = verb.substring(0, verb.length - 1)
    }

    return base + 'ing'
}

const handle = (message = {}, callback = (() => {})) => {
    const {verb = '', suffix = '', hint = ''} = message

    const onError = (err) => {
        print()
        error(`Failed to ${verb.toLowerCase()} ${suffix}`)
        if (err) {
            printTo.error(redCross, err)
        }

        if (hint) {
            warn(hint)
        }
    }

    printNoLineBreak(`${getPresentParticiple(verb)} ${suffix}...`)

    try {
        callback()
    }
    catch (err) {
        onError(err)
        return false
    }

    success()
    return true
}

module.exports = {handle, success, info, warn, print, setSilent}
