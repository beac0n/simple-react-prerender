#!/usr/bin/env node

const util = require('./util')
util.mockBrowser(global)
util.globalizeClasses(global.window)

const program = require('./cliSetup')
const chalk = require('chalk')
const path = require('path')
const Module = require('module')
const fs = require('fs')

const React = require('react')
const ReactDOMServer = require('react-dom/server')

const {html: builtIndexHtmlPath, rootId, app: appPath, babel} = program

let babelConfig = {presets: ['react-app']}

if (babel) {
    util.printHandle({
        prefix: 'Parsing',
        suffix: `your provided ${chalk.yellow('babel')} config`,
        errorPart: 'parse',
        hint: `Make sure your ${chalk.yellow('babel')} config is a valid ${chalk.yellow('JSON')} string`,
    }, () => babelConfig = JSON.parse(babel))
}

process.env.NODE_ENV = 'production'
process.env.ON_SERVER = 'true'

require('babel-register')(babelConfig)

util.print(`Creating an optimized, prerendered index.html...`)

const fsOptions = {encoding: 'utf8'}
const rootDivPrefix = `<div id="${rootId}">` // TODO: make this configurable
const rootDivPostfix = '</div>' // TODO: make this configurable
const rootDiv = rootDivPrefix + rootDivPostfix

// TODO: make this configurable
const fileEndingRegex = /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|css|less|sass)$/
const originalRequire = Module.prototype.require;
Module.prototype.require = function (requirePath, ...remainingArgs) {
    try {
        const fileExtension = path.parse(requirePath).ext
        if (fileExtension.length > 0 && fileEndingRegex.test(fileExtension)) {
            return // file extension can't be loaded by node => ignore
        }
    }
    catch (err) {
        // let the original require call handle this...
    }

    return originalRequire.apply(this, [requirePath, ...remainingArgs]);
}

let App
util.printHandle({
    prefix: 'Executing',
    suffix: `${chalk.yellow(`require(${appPath}).default`)}`, // TODO: higlight commands in all printHandle
    errorPart: 'execute',
    hint: `The file in ${appPath} has to export the App using either ${chalk.yellow('export default App')} or ` +
    `${chalk.yellow('module.exports = { default: App}')}`,
}, () => App = require(appPath).default)

let builtIndexHtml
util.printHandle({
    prefix: 'Reading',
    suffix: chalk.yellow(builtIndexHtmlPath),
    errorPart: 'find',
    hint: `Make sure that this process can read the file you supplied: ${chalk.yellow(builtIndexHtmlPath)}`,
}, () => builtIndexHtml = fs.readFileSync(builtIndexHtmlPath, fsOptions))

util.printHandle({
    prefix: 'Searching for',
    suffix: `${chalk.yellow(rootDiv)} in file in ${chalk.yellow(builtIndexHtmlPath)}`,
    errorPart: 'find',
    hint: `Make sure that there are no unnecessary spaces between or in ` +
    `${chalk.yellow(rootDivPrefix)} and ${chalk.yellow(rootDivPostfix)}.\n` +
    `Also the App might already be prerendered in ${chalk.yellow(builtIndexHtmlPath)}`,
}, () => {
    if (!builtIndexHtml.includes(rootDiv)) throw ''
})

let prerendererdString
util.printHandle({
    prefix: 'Prerendering',
    suffix: `React Component from ${chalk.yellow(appPath)}`,
    errorPart: 'prerender',
    hint: `We are trying to mock the browser the best we can, but sometimes that doesn't work.\n` +
    `Try using the ${chalk.yellow('ON_SERVER')} environment variable in your code, to check if your code is being prerendered or not.\n` +
    `If you are using global constructors (like ${chalk.yellow('new FormData()')}), try calling the constructor from ` +
    `the window object (e.g. ${chalk.yellow('new window.FormData()')}`,
}, () => prerendererdString = ReactDOMServer.renderToString(React.createElement(App)))

let newIndexHtml
util.printHandle({
    prefix: 'Replacing',
    suffix: `${chalk.yellow(rootDiv)} with prerendered html`,
    errorPart: 'replace',
}, () => newIndexHtml = builtIndexHtml.replace(rootDiv, rootDivPrefix + prerendererdString + rootDivPostfix))

util.printHandle({ // TODO implement dry run
    prefix: 'Overwriting',
    suffix: `${chalk.yellow(builtIndexHtmlPath)}, containing the prerendered React Component from ${chalk.yellow(appPath)}`,
    errorPart: 'overwrite',
    hint: `Make sure that this process can write to the file you supplied (${chalk.yellow(builtIndexHtmlPath)}) ` +
    `and that it is not being used by another process`,
}, () => fs.writeFileSync(builtIndexHtmlPath, newIndexHtml, fsOptions))

util.printSuccess('Prerendered successfully.')
util.print()
process.exit(0)
