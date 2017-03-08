#!/usr/bin/env node

process.env.NODE_ENV = 'production'
process.env.ON_SERVER = 'true'

require('dotenv').config()
require('babel-register')({
    presets: ['react-app']
})

const path = require('path')
const Module = require('module')

const MockBrowser = require('mock-browser').mocks.MockBrowser
const mock = new MockBrowser()
global.window = mock.getWindow()
global.document = mock.getDocument()
global.location = mock.getLocation()
global.navigator = mock.getNavigator()
global.history = mock.getHistory()
global.localStorage = mock.getLocalStorage()
global.sessionStorage = mock.getSessionStorage()

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
};

require('./src/prerender')
