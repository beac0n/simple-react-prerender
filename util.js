const Module = require('module')
const path = require('path')
const MockBrowser = require('mock-browser').mocks.MockBrowser

// jsdom keeps global stuff in window._core: https://github.com/tmpvar/jsdom/blob/master/lib/jsdom/browser/Window.js
const globalizeWebAPIs = () => Object.keys(global.window._core).forEach((key) => global[key] = global.window._core[key])
const mockBrowser = () => {
    if (global.window) return

    const mockBrowser = new MockBrowser()

    global.window = mockBrowser.getWindow()
    global.document = mockBrowser.getDocument()
    global.location = mockBrowser.getLocation()
    global.navigator = mockBrowser.getNavigator()
    global.history = mockBrowser.getHistory()
    global.localStorage = mockBrowser.getLocalStorage()
    global.sessionStorage = mockBrowser.getSessionStorage()

    globalizeWebAPIs()
}

const overwriteRequire = () => {
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
}

module.exports = {mockBrowser, overwriteRequire}
