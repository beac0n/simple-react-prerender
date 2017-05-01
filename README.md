# Simple React Prerenderer

The Simple React Prerenderer is designed to simply prerender existing react apps, without having to configure much.

# Quick Start

Install the script

```
yarn add simple-react-prerender --dev
```

then use it in a self written script:
```
const prerenderer = require('simple-react-prerender')
prerenderer({
    // the path to the file where the app shall be prerendered
    html: '/path/to/index.html',
    // the app to prerender
    app: '/path/to/App/index.js',
    // the props for the app
    props: {properties, for, the, app}
    // the config of jsdom - useful if you are using ReactRouter
    jsDom: {
        url: 'https://example.org/',
        referrer: 'https://example.org/',
        contentType: 'text/html',
    },
    // the babel config - will be used with babe-register
    babel: undefined,
    // dry run - no file will be changed
    dry: false,
    // silent mode - don't print anything on the console
    silent: false,
})
```
