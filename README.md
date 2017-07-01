# Simple React Prerenderer

The Simple React Prerenderer is designed to simply prerender existing react apps, without having to configure much.

# Quick Start

Install the package

yarn:
```
yarn add simple-react-prerender --dev
```

npm:

```
npm install simple-react-prerender --save-dev
```

then use it in a self written script:
```javascript
const prerenderer = require('simple-react-prerender')
const MyAppToPrerender = require('./src/myAppToPrerender')

const jsDomConfig = {
    url: 'https://example.org/',
    referrer: 'https://example.org/',
    contentType: 'text/html',
}

// use prerenderer.mockBrowser, if you are NOT providing the app via a file path.
prerenderer.mockBrowser(jsDomConfig)

prerenderer({
    // optional: the path to the file where the app shall be prerendered
    // if provided, simple-react-prerender will write the prerendered app there
    // if not provided, simple-react-prerender will return the prerendered string
    html: '/path/to/index.html',

    // mandatory: the app to prerender. This can be either a file path, or the required app itself
    app: '/path/to/App/index.js',
    // app: MyAppToPrerender,

    // optional: the props for the app
    props: {}

    // optional: the config of jsdom - useful if you are using ReactRouter
    // if using ReactRouter, check https://reacttraining.com/react-router/web/guides/server-rendering
    jsDom: jsDomConfig,

    // optional: the babel config - will be used with babel-register
    // can be a JSON string or an object
    babel: undefined,

    // optional: dry run - no file will be changed
    dry: false,

    // optional: silent mode - don't print anything on the console
    silent: false,
})
```

# Usage with Redux

You should also read this: http://redux.js.org/docs/recipes/ServerRendering.html

Provide a component, which wraps the `react-redux` `Provider` component.
This file will be used by simple-react-prerender, to prerender your app:
```javascript
import React from 'react'
import {Provider} from 'react-redux'
import AppRouter from './components/appRouter'

const ProviderApp = ({store}) => <Provider store={store}><AppRouter/></Provider>

export default ProviderApp
```

Furthermore, you will need a prerender script:
```javascript
const prerenderer = require('simple-react-prerender')

// if your store initializer needs babel
require('babel-register')({
    plugins: [
        'transform-es2015-modules-commonjs',
        'syntax-object-rest-spread',
        'transform-object-rest-spread',
    ],
})

// provide simple window mock if you use the redux dev-tools
window = {}

// create the store
const {initStore} = require('../src/redux/init')
const store = initStore()

prerenderer({
    html: '/path/to/index.html',
    app: '/path/to/ProviderApp.js',
    // pass the store to the provider app
    props: {store},
})
```

finally, run the prerender script:

```
node scripts/prerender.js
```