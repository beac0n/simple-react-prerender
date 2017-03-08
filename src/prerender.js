const fs = require('fs')
const React = require('react')
const ReactDOMServer = require('react-dom/server')

const {print, printSuccess, printHandle, printHandleEnvVar} = require('./util')

print(`Creating an optimized, prerendered index.html...`)

printHandleEnvVar('BUILT_HTML_PATH', 'The path where the build index.html lies')
printHandleEnvVar('ROOT_ID', 'The id of the div, in which the App is rendered')
printHandleEnvVar('APP_PATH', 'The path to the source file, in which the source code of the App lies')

const builtIndexHtmlPath = process.env.BUILT_HTML_PATH
const rootId = process.env.ROOT_ID
const AppPath = process.env.APP_PATH

const fsOptions = {encoding: 'utf8'}
const rootDivPrefix = `<div id="${rootId}">`
const rootDivPostfix = '</div>'
const rootDiv = rootDivPrefix + rootDivPostfix

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
