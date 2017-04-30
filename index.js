const path = require('path')
const fs = require('fs')

const chalk = require('chalk')
const React = require('react')
const ReactDOMServer = require('react-dom/server')

const util = require('./util')
const printUtil = require('./printUtil')

process.env.NODE_ENV = 'production'
process.env.ON_SERVER = 'true'

const fsOptions = {encoding: 'utf8'}

const steps = [
    ({dry}) => {
        process.env.NODE_ENV = 'production'
        process.env.ON_SERVER = 'true'

        printUtil.print(`Creating an optimized, prerendered index.html...`)
        if (dry) {
            printUtil.info(`Dry run is enabled - no files will be changed...`)
        }
        printUtil.print()
    },
    (state) => {
        // TODO: check if babel is a rc file => load file
        const {babel} = state
        if (babel) {
            state.hasError = !printUtil.handle({
                verb: 'Parse',
                suffix: `your provided ${chalk.yellow('babel')} config`,
                errorPart: 'parse',
                hint: `Make sure your ${chalk.yellow('babel')} config is a valid ${chalk.yellow('JSON')} string`,
            }, () => require('babel-register')(typeof babel === 'string' ? JSON.parse(babel) : babel))
        }
    },
    (state) => {
        util.mockBrowser()
        util.nodeifyRequire()
        const {app} = state
        state.hasError = !printUtil.handle({
            verb: 'Execute',
            suffix: `${chalk.yellow(`require(${app}).default`)}`,
            hint: `The file in ${app} has to export the App using either ${chalk.yellow('export default App')} or ` +
            `${chalk.yellow('module.exports = { default: App}')}`,
        }, () => state.AppComponent = require(app).default)
    },
    (state) => {
        const {app, props} = state
        state.hasError = !printUtil.handle({
            verb: 'Prerender',
            suffix: `React Component from ${chalk.yellow(app)}`,
            hint: `We are trying to mock the browser the best we can, but sometimes that doesn't work.\n` +
            `Try using the ${chalk.yellow('ON_SERVER')} environment variable in your code, to check if your code is being prerendered or not.\n` +
            `If you are using the Web API (like ${chalk.yellow('new FormData()')}), try calling the constructor from ` +
            `the window object (e.g. ${chalk.yellow('new window.FormData()')}`,
        }, () => state.prerendererd = ReactDOMServer.renderToString(React.createElement(state.AppComponent, props)))
    },
    (state) => {
        const {html, dry} = state
        state.hasError = !printUtil.handle({
            verb: 'Read',
            suffix: chalk.yellow(html),
            hint: `Make sure that this process can read the file you supplied: ${chalk.yellow(html)}`,
        }, () => state.builtIndexHtml = fs.readFileSync(html, fsOptions), dry)
    },
    (state) => {
        const {html, dry, div, divPrefix, divSuffix} = state
        state.hasError = !printUtil.handle({
            verb: 'Search',
            suffix: `for ${chalk.yellow(div)} in file in ${chalk.yellow(html)}`,
            hint: `Make sure that there are no unnecessary spaces between or in ` +
            `${chalk.yellow(divPrefix)} and ${chalk.yellow(divSuffix)}.\n` +
            `Also the App might already be prerendered in ${chalk.yellow(html)}`,
        }, () => {
            if (!state.builtIndexHtml.includes(div)) throw ''
        }, dry)
    },
    (state) => {
        const {dry, div, divPrefix, divSuffix} = state
        state.hasError = !printUtil.handle({
            verb: 'Replace',
            suffix: `${chalk.yellow(div)} with prerendered html`,
        }, () => state.newIndexHtml = state.builtIndexHtml.replace(div, divPrefix + state.prerendererd + divSuffix), dry)
    },
    (state) => {
        const {html, app, dry} = state
        state.hasError = !printUtil.handle({
            verb: 'Overwrite',
            suffix: `${chalk.yellow(html)}, containing the prerendered React Component from ${chalk.yellow(app)}`,
            hint: `Make sure that this process can write to the file you supplied (${chalk.yellow(html)}) ` +
            `and that it is not being used by another process`,
        }, () => fs.writeFileSync(html, state.newIndexHtml, fsOptions), dry)
    },
    () => {
        printUtil.success('Prerendered successfully.')
        printUtil.print()
    },
]

const execute = ({html, rootId = 'root', app, props, babel, dry = false}) => {
    const divPrefix = `<div id="${rootId}">`
    const divSuffix = '</div>'
    const div = divPrefix + divSuffix

    const state = {hasError: false, html, divPrefix, divSuffix, div, app, props, babel, dry}

    for(let i = 0; i < steps.length; ++i) {
        steps[i](state)

        if (state.hasError) {
            printUtil.info('Stopping prerender')
            return false
        }
    }

    return true
}

module.exports = execute
