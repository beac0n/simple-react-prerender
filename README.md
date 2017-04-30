# Simple React Prerenderer

The Simple React Prerenderer is designed to simply prerender existing react apps, without having to configure much.

# Quick Start

Install the script

```
yarn add simple-react-prerender --dev
```

then use `simple-react-prerender` as script in your `package json`.
Don't forget to supply the mandatory arguments:

```
-h, --help                  output usage information
-V, --version               output the version number
-h --html <htmlPath>        path to built html
-a --app <appPath>          path to app source file
-p --props <appProperties>  properties for the app
-i --rootId <rootId>        div id where the app is rendered
```

or use it in a self written script:
```
const prerenderer = require('simple-react-prerender')
prerenderer({
    html: '/path/to/index.html',
    app: '/path/to/App/index.js',
    props: {properties, for, the, app}
})
```
