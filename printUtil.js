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

const info = (message = '') => console.info(chalk.white(parseMessage(message, blueInfo)))
const warn = (message = '') => console.warn(parseMessage(message, yellowSign))
const error = (message = '') => console.error(parseMessage(message, redCross))
const printNoLineBreak = (message = '') => process.stdout.write(message.trim())

const print = (message = '') => console.log(message.trim())
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

const handle = (message = {}, callback = (() => {}), skip = false) => {
    const {verb = '', suffix = '', hint = ''} = message

    const onError = (err) => {
        print()
        error(`Failed to ${verb.toLowerCase()} ${suffix}`)
        if (err) {
            console.error(redCross, err)
        }

        if (hint) {
            warn(hint)
        }
    }

    if (skip) {
        printNoLineBreak(parseMessage(`Skipping to ${verb.toLowerCase()} ${suffix}...`, blueInfo))
    }
    else {
        printNoLineBreak(`${getPresentParticiple(verb)} ${suffix}...`)
        try {
            callback()
        }
        catch (err) {
            onError(err)
            return false
        }
    }

    success()
    return true
}

module.exports = {handle, success, info, warn, print}
