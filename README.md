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
-h --html <htmlPath>      path to built html
-a --app <appPath>        path to app source file
-i --rootId <rootId>      div id where the app is rendered
-b --babel [babelConfig]  a JSON string, providing your babel config
```

For example:

```json
"scripts": {
  "prerender": "simple-react-prerender -h /home/foobar/dev/barfoo/build/index.html -a /home/foobar/dev/barfoo/src/App/index.js -i root -b '{\"presets\":[\"react-app\"]}'"
}
```