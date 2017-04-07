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

const printInfo = (message = '') => console.info(parseMessage(message, blueInfo))
const printWarn = (message = '') => console.warn(parseMessage(message, yellowSign))
const printError = (message = '') => console.error(parseMessage(message, redCross))
const printNoLineBreak = (message = '') => process.stdout.write(message.trim())

const print = (message = '') => console.log(message.trim())
const printSuccess = (message = '') => print(chalk.green(`${message} ${greenHook}`))

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

const printHandle = (message = {}, callback) => {
    const {verb = '', suffix = '', hint = ''} = message

    const onError = (err) => {
        print()
        printError(`Failed to ${verb.toLowerCase()} ${suffix}`)
        if (err) {
            console.error(redCross, err)
        }

        if (hint) {
            printWarn(hint)
        }
    }

    printNoLineBreak(`${getPresentParticiple(verb)} ${suffix}...`)
    try {
        callback()
        printSuccess()
    }
    catch (err) {
        onError(err)
        return false
    }

    return true
}

module.exports = {printHandle, printSuccess, printInfo, print}
