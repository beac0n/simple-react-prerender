import fs from 'fs'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import chalk from 'chalk'
import console from 'better-console'

const greenHook = chalk.green('✔')

const print = (message, callback) => {
    const {prefix, suffix, errorPart} = message

    const onError = (err) => {
        console.log()
        console.error(`✖ Failed to ${errorPart} ${suffix}`)
        if (err && err.message) {
            console.error(err)
        }
        process.exit(1)
    }

    process.stdout.write(`${prefix} ${suffix}...` || '')
    try {
        callback()
        console.log(` ${greenHook}`)
    }
    catch (err) {
        onError(err)
    }
}

const printForEnvVar = (envVarName) => {
    const envVar = process.env[envVarName]

    print({
        prefix: 'Checking',
        suffix: `if process.env.${envVarName} is set`,
        errorPart: 'check'
    }, () => {
        if (!envVar) {
            throw new Error(`Expected process.env.${envVarName} to be set but was ${envVar}`)
        }
    })
}

console.log(`Creating an optimized, prerendered index.html...`)

printForEnvVar('BUILT_HTML_PATH')
printForEnvVar('ROOT_ID')
printForEnvVar('APP_PATH')

const builtIndexHtmlPath = process.env.BUILT_HTML_PATH
const rootId = process.env.ROOT_ID
const AppPath = process.env.APP_PATH

const fsOptions = {encoding: 'utf8'}
const rootDivPrefix = `<div id="${rootId}">`
const rootDivPostfix = '</div>'

const rootDiv = rootDivPrefix + rootDivPostfix
let App;
print({
    prefix: 'Executing',
    suffix: `require("${AppPath}").default`,
    errorPart: 'execute'
}, () => App = require(AppPath).default)

let builtIndexHtml;
print({
    prefix: 'Reading',
    suffix: builtIndexHtmlPath,
    errorPart: 'find'
}, () => builtIndexHtml = fs.readFileSync(builtIndexHtmlPath, fsOptions))

print({
    prefix: 'Searching for',
    suffix: `"${rootDiv}" in file in ${builtIndexHtmlPath}`,
    errorPart: 'find'
}, () => {
    if (!builtIndexHtml.includes(rootDiv)) throw new Error()
})

let prerendererdString;
print({
    prefix: 'Prerendering',
    suffix: `React Component from ${AppPath}`,
    errorPart: 'prerender',
}, () => prerendererdString = ReactDOMServer.renderToString(<App />))

let newIndexHtml
print({
    prefix: 'Replacing',
    suffix: `"${rootDiv}" with prerendered html`,
    errorPart: 'replace'
}, () => newIndexHtml = builtIndexHtml.replace(rootDiv, rootDivPrefix + prerendererdString + rootDivPostfix))

print({
    prefix: 'Overwriting',
    suffix: `${builtIndexHtmlPath}, containing the prerendered React Component from ${AppPath}`,
    errorPart: 'overwrite'
}, () => fs.writeFileSync(builtIndexHtmlPath, newIndexHtml, fsOptions))

console.log(chalk.green(`Prerendered successfully. ${greenHook}`))
console.log()
process.exit(0)
