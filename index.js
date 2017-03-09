#!/usr/bin/env node

const program = require('commander')
program
    .version('2.0.0')
    .option('-h --html <htmlPath>', 'path to built html')
    .option('-a --app <appPath>', 'path to app source file')
    .option('-i --rootId <rootId>', 'div id where the app is rendered')
    //.option('-b --babel [babelConfig]', 'a JSON string, providing your babel config') // TODO
    .parse(process.argv)

const builtIndexHtmlPath = program.html
const rootId = program.rootId
const AppPath = program.app

if(!builtIndexHtmlPath || !rootId || !AppPath ) {
    program.help()
}

process.env.NODE_ENV = 'production'
process.env.ON_SERVER = 'true'

const path = require('path')
const Module = require('module')
const fs = require('fs')
const React = require('react')
const ReactDOMServer = require('react-dom/server')

const {print, printSuccess, printHandle} = require('./util')

const MockBrowser = require('mock-browser').mocks.MockBrowser
const mock = new MockBrowser()
global.window = mock.getWindow()
global.document = mock.getDocument()
global.location = mock.getLocation()
global.navigator = mock.getNavigator()
global.history = mock.getHistory()
global.localStorage = mock.getLocalStorage()
global.sessionStorage = mock.getSessionStorage()

print(`Creating an optimized, prerendered index.html...`)

require('babel-register')({presets: ['react-app']})

const fsOptions = {encoding: 'utf8'}
const rootDivPrefix = `<div id="${rootId}">`
const rootDivPostfix = '</div>'
const rootDiv = rootDivPrefix + rootDivPostfix

const fileEndingRegex = /\.(css|png)$/
const originalRequire = Module.prototype.require;
Module.prototype.require = function (requirePath, ...remainingArgs) {
    try {
        const fileExtension = path.parse(requirePath).ext
        if (fileExtension.length > 0 && fileEndingRegex.test(fileExtension)) {
            return
        }
    }
    catch (err) {
        // let the original require call handle this...
    }

    return originalRequire.apply(this, [requirePath, ...remainingArgs]);
}
let App
printHandle({
    prefix: 'Executing',
    suffix: `require("${AppPath}").default`,
    errorPart: 'execute',
    hint: `The file in ${AppPath} has to export the App using either "export default App" or module.exports = { default: App}`,
}, () => App = require(AppPath).default)

let builtIndexHtml
printHandle({
    prefix: 'Reading',
    suffix: builtIndexHtmlPath,
    errorPart: 'find',
    hint: `Make sure that this process can read the file you supplied: ${builtIndexHtmlPath}`,
}, () => builtIndexHtml = fs.readFileSync(builtIndexHtmlPath, fsOptions))

printHandle({
    prefix: 'Searching for',
    suffix: `"${rootDiv}" in file in ${builtIndexHtmlPath}`,
    errorPart: 'find',
    hint: `Make sure that there are no unnecessary spaces between or in ${rootDivPrefix} and ${rootDivPostfix}.\n` +
    `Also the App might already be prerendered in ${builtIndexHtmlPath}`,
}, () => {
    if (!builtIndexHtml.includes(rootDiv)) throw ''
})

let prerendererdString
printHandle({
    prefix: 'Prerendering',
    suffix: `React Component from ${AppPath}`,
    errorPart: 'prerender',
    hint: `We are trying to mock the browser the best we can, but sometimes that doesn't work.\n` +
    `Try using the "ON_SERVER" environment variable in your code, to check if your code is being prerendered or not`,
}, () => prerendererdString = ReactDOMServer.renderToString(React.createElement(App)))

let newIndexHtml
printHandle({
    prefix: 'Replacing',
    suffix: `"${rootDiv}" with prerendered html`,
    errorPart: 'replace',
}, () => newIndexHtml = builtIndexHtml.replace(rootDiv, rootDivPrefix + prerendererdString + rootDivPostfix))

printHandle({
    prefix: 'Overwriting',
    suffix: `${builtIndexHtmlPath}, containing the prerendered React Component from ${AppPath}`,
    errorPart: 'overwrite',
    hint: `Make sure that this process can write to the file you supplied (${builtIndexHtmlPath}) ` +
    `and that it is not being used by another process`,
}, () => fs.writeFileSync(builtIndexHtmlPath, newIndexHtml, fsOptions))

printSuccess('Prerendered successfully.')
print()
process.exit(0)
