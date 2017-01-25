# dynamic-public-path-webpack-plugin
Allows you to use a global, client side variable to set publicPath instead of the string arbitrarily set options.publicPath.

Works with Webpack 2 and 1.

### Installation
``` sh
    > npm i dynamic-public-path-webpack-plugin --save-dev
```

### Usage

#### 1. Simple use
   webpack.conf.js:

``` javascript
const DynamicPublicPathPlugin = require("dynamic-public-path-webpack-plugin");

module.exports = {
    entry: {
        app: ['./main.js'],
    },
    output: {
        filename: '[name].js',
        path: '.dist/',
        publicPath: 'http://publicPath.com' // Mandatory!
    },
    plugins: [
        new DynamicPublicPathPlugin({
            externalGlobal: 'window.cdnPathFromBackend', //Your global variable name.
            chunkName: 'app' // Chunk name from "entry".
        })
    ]
}
```

**Important!** 
Use distinctive strings as `output.publicPath`. 
It functions as a placeholder, and if it collides with other strings in
your files, the plugin will break your code.