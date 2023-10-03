var webpack = require('webpack');
var path = require('path');
const UglifyJsPlugin = require('uglifyjs-3-webpack-plugin')

module.exports = {
    entry: {
        index: path.join(__dirname, "index.js"),
        browser: path.join(__dirname, "dev/browser.js"),
    },
    output: {
        filename: '[name].min.js',
        path: path.join(__dirname, 'dist'),
    },
    mode: process.env.NODE_ENV,
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {}
        })
    ]
}