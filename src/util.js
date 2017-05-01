const Module = require('module')
const jsdom = require('jsdom')
const {JSDOM} = jsdom

const MockBrowser = require('mock-browser').mocks.MockBrowser

// jsdom keeps global stuff in window._core: https://github.com/tmpvar/jsdom/blob/master/lib/jsdom/browser/Window.js
const globalizeWebAPIs = (dom) => Object.keys(dom && dom.window && dom.window._core || {})
    .forEach((key) => global[key] = dom.window._core[key])

const mockBrowser = (jsDom = {
    url: 'https://example.org/',
    referrer: 'https://example.org/',
    contentType: 'text/html',
}) => {
    if (global.window && global.window.__SIMPLE_REACT_PRERENDER__) return

    const dom = new JSDOM('', jsDom);

    global.window = dom.window
    global.window.__SIMPLE_REACT_PRERENDER__ = true
    global.document = dom.window.document
    global.navigator = window.navigator
    global.location = dom.window.location
    global.history = dom.window.history

    const mockBrowser = new MockBrowser()
    global.localStorage = mockBrowser.getLocalStorage()
    global.sessionStorage = mockBrowser.getSessionStorage()

    globalizeWebAPIs(dom)

    require('es6-promise').polyfill()
    require('isomorphic-fetch')
}

const nodeifyRequire = () => {
    const originalRequire = Module.prototype.require
    Module.prototype.require = function (requirePath, ...remainingArgs) {
        try {
            return originalRequire.apply(this, [requirePath, ...remainingArgs])
        }
        catch (err) {
            if (err.message.includes('Unexpected token')) {
                return // file can't be loaded by node => ignore
            }
        }

        return originalRequire.apply(this, [requirePath, ...remainingArgs])
    }
}

module.exports = {mockBrowser, nodeifyRequire}
