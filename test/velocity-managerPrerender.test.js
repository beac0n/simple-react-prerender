const assert = require('assert')
const path = require('path')
const prerenderer = require('../index')

prerenderer.mockBrowser()

require('babel-register')({
    presets: ['react-app'],
    plugins: [
        'transform-es2015-modules-commonjs',
        'syntax-object-rest-spread',
        'transform-object-rest-spread',
    ],
})
const {initStore} = require('./velocity-manager/src/redux/init')

const prerenderedStart = '<div data-reactroot="" data-reactid="1" data-react-checksum="'

describe('prerender', () => {
    let store

    beforeEach(() => {
        store = initStore()
    })

    it('should prerender without errors, using file path for app', () => {
        const prerendered = prerenderer({
            app: path.resolve(__dirname, 'velocity-manager/src/providerApp.js'),
            props: {store}
        })

        assert(prerendered.includes(prerenderedStart))
    })

    it('should prerender without errors, using app', () => {
        const prerendered = prerenderer({
            app: require(path.resolve(__dirname, 'velocity-manager/src/providerApp.js')),
            props: {store}
        })

        assert(prerendered.includes(prerenderedStart))
    })

    it('should prerender with errors, because of missing config', () => {
        try {
            prerenderer()
            assert.fail('prerender did not throw error')
        } catch (e) {
            assert.equal(e.message, 'no config object was provided. Please check the README and provide a valid config object.')
        }
    })

    it('should prerender with errors, because of missing app', () => {
        try {
            prerenderer({props: {store}})
            assert.fail('prerender did not throw error')
        } catch (e) {
            assert.equal(e.message, 'no valid app was provided, so there is nothing to prerender. Please provide an app to prerender, either as component or as file path.')
        }
    })
})
