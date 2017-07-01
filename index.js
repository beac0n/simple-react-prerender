const printUtil = require('./src/printUtil')
const steps = require('./src/steps')

process.env.NODE_ENV = 'production'
process.env.ON_SERVER = 'true'

const execute = (config) => {
    if(!config) {
        throw new Error('no config object was provided. Please check the README and prove a valid config object.')
    }

    const {html, app, jsDom} = config
    const {rootId = 'root', props = {}, babel = {presets: ['react-app']}, dry = false, silent = false} = config

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

    const stepsArray = [
        ...steps.initSteps,
        ...(html && dry ? steps.dryRunInfoSteps : []),
        ...steps.infoSteps,
        ...steps.mandatorySteps,
        ...(html && !dry ? steps.htmlReplaceSteps : []),
        ...steps.endSteps,
    ]

    printUtil.setSilent(silent)

    for (let i = 0; i < stepsArray.length; ++i) {
        stepsArray[i](state)

        if (state.hasError) {
            printUtil.info('Stopping prerender')
            return false
        }
    }

    return html ? true : state.prerendererd
}

module.exports = execute
