const printUtil = require('./printUtil')
const steps = require('steps')

process.env.NODE_ENV = 'production'
process.env.ON_SERVER = 'true'

const execute = ({rootId = 'root', html, app, props = {}, jsDom, babel = {presets: ['react-app']}, dry = false, silent = false}) => {
    const divPrefix = `<div id="${rootId}">`
    const divSuffix = '</div>'
    const div = divPrefix + divSuffix

    const state = {
        hasError: false,
        divPrefix,
        divSuffix,
        div,
        html,
        app,
        props,
        jsDom,
        babel,
    }

    const steps = [
        ...steps.initSteps,
        ...(html && dry ? steps.dryRunInfoSteps : []),
        ...steps.infoSteps,
        ...steps.mandatorySteps,
        ...(html && !dry ? steps.htmlReplaceSteps : []),
        ...steps.endSteps,
    ]

    printUtil.setSilent(silent)

    for (let i = 0; i < steps.length; ++i) {
        steps[i](state)

        if (state.hasError) {
            printUtil.info('Stopping prerender')
            return false
        }
    }

    return html ? true : state.prerendererd
}

module.exports = execute
