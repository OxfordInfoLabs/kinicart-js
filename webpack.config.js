const path = require('path');
const webpack = require('webpack');


const ROOT = path.resolve(__dirname, 'ts');
const DESTINATION = path.resolve(__dirname, 'dist');

module.exports = {
    context: ROOT,

    entry: {
        'Kinicart': 'index.ts'
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        "allowTsInNodeModules": true
                    }

                },
                    'uglify-template-string-loader']
            }
        ]
    },

    output: {
        library: 'Kinicart',
        libraryTarget: 'umd',
        libraryExport: 'default',
        filename: 'kinicart.js',
        path: DESTINATION
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            ROOT,
            'node_modules'
        ],
        alias: {
            'vue$': 'vue/dist/vue.min.js'
        }
    },
    mode: "production"
};

