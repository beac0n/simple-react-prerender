const chalk = require('chalk')
const console = require('better-console')
const MockBrowser = require('mock-browser').mocks.MockBrowser

const yellowSign = chalk.yellow('\u26A0')
const redCross = chalk.red('\u2716')
const greenHook = chalk.green('\u2714')
const blueInfo = chalk.blue('\u2139')

const messageParseRegex = new RegExp('\n', 'g')
const messageParse = (message, newLineReplacement) => typeof message === 'string'
    ? `${newLineReplacement} ${message.replace(messageParseRegex, `\n${newLineReplacement} `)}.`
    : ''

const printInfo = (message) => console.info(messageParse(message, blueInfo))
const printWarn = (message) => console.warn(messageParse(message, yellowSign))
const printError = (message) => console.error(messageParse(message, redCross))
const printNoLineBreak = (message) => process.stdout.write(message)

const print = (message) => console.log(message || '')
const printSuccess = (message) => print(chalk.green(`${message || ''} ${greenHook}`))

const printHandle = (message, callback) => {
    const {prefix, suffix, errorPart, hint} = message

    const onError = (err) => {
        print()
        printError(`Failed to ${errorPart} ${suffix}`)
        if (err) {
            console.error(redCross, err)
        }

        if (hint) {
            printWarn(hint)
        }

        printInfo('Stopping prerender')
        process.exit(0)
    }

    printNoLineBreak(`${prefix} ${suffix}...`)
    try {
        callback()
        printSuccess()
    }
    catch (err) {
        onError(err)
    }
}

const printHandleEnvVar = (environmentVariableName, description) => {
    const envVar = process.env[environmentVariableName]

    printHandle({
        prefix: 'Checking',
        suffix: `if process.env.${environmentVariableName} is set`,
        errorPart: 'check',
        hint: `Make sure that you have set the needed environment variable ${environmentVariableName}: ${description}`,
    }, () => {
        if (!envVar) throw `Expected process.env.${environmentVariableName} to be set but was ${envVar}`
    })
}

const globalizeClassesRegex = new RegExp(/[A-Z]/)
const globalizeClasses = (classesContainerObject) => {
    Object.keys(classesContainerObject)
        .filter((key) => key.charAt(0).match(globalizeClassesRegex))
        .forEach((key) => global[key] = classesContainerObject[key])
}

const mockBrowser = (mock) => {
    const mockBrowser = new MockBrowser()

    mock.window = mockBrowser.getWindow()
    mock.document = mockBrowser.getDocument()
    mock.location = mockBrowser.getLocation()
    mock.navigator = mockBrowser.getNavigator()
    mock.history = mockBrowser.getHistory()
    mock.localStorage = mockBrowser.getLocalStorage()
    mock.sessionStorage = mockBrowser.getSessionStorage()
}

module.exports = {printHandleEnvVar, printHandle, printSuccess, print, globalizeClasses, mockBrowser}