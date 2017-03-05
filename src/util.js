import chalk from 'chalk'
import console from 'better-console'

const yellowSign = chalk.yellow('\u26A0')
const redCross = chalk.red('\u2716')
const greenHook = chalk.green('\u2714')
const blueInfo = chalk.blue('\u2139')

const messageParse = (message, newLineReplacement) => typeof message === 'string'
    ? `${newLineReplacement} ${message.replace('\n', `\n${newLineReplacement} `)}.`
    : ''

const printInfo = (message) => console.info(messageParse(message, blueInfo))
const printWarn = (message) => console.warn(messageParse(message, yellowSign))
const printError = (message) => console.error(messageParse(message, redCross))
const printNoLineBreak = (message) => process.stdout.write(message)

export const print = (message) => console.log(message || '')
export const printSuccess = (message) => print(chalk.green(`${message || ''} ${greenHook}`))

export const printHandle = (message, callback) => {
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

export const printHandleEnvVar = (environmentVariableName, description) => {
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