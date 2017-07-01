const assert = require('assert')
const prerenderer = require('../index')

require('babel-register')({
    plugins: [
        'transform-es2015-modules-commonjs',
        'syntax-object-rest-spread',
        'transform-object-rest-spread',
    ],
})

window = {}
const {initStore} = require('./velocity-manager/src/redux/init')

describe('prerender', () => {
    let store

    beforeEach(() => {
        store = initStore()
    })

    it('should prerender without errors', () => {
        const prerendered = prerenderer({
            app: '/home/beac0n/dev/velocity-manager/src/providerApp.js',
            props: {store}
        })

        assert(prerendered.length > 0)
    })

    it('should prerender with errors', () => {
        prerenderer()
    })
})
