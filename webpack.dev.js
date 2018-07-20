const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {
    devtool: 'source-map',

    entry: ['bootstrap-loader', 'babel-polyfill', './client/main.js'],

    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'client/src/dist'),
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            Modules: path.resolve(__dirname, 'node_modules/'),
            Venders: path.resolve(__dirname, 'client/src/')
        }
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'stage-2']
                // presets: ['env', {"targets": {"ie": 8}, "debug": true} ]
            }
        },
        {
            test: /\.pug$/,
            use: ['html-loader', 'pug-html-loader?pretty=true&exports=false']
        },
        {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: 'css-loader'
            })
        },
        {
            test: /\.(scss|sass)$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                    loader: 'css-loader',
                    options: {
                        sourceMap: true,
                        importLoaders: true
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: 'inline',
                        plugins: function () {
                            return [require('autoprefixer')];
                        }
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        outputStyle: 'expanded',
                        sourceMap: true
                    }
                }
                ]
            })
        },
        {
            // test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            use: {
                loader: 'url-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                    publicPath: './',
                    limit: 100000
                }
            }
        },
        {
            test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
            use: {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                    publicPath: './'
                }
            }
        },
        {
            test: /bootstrap-sass\/assets\/javascripts\//, use: 'imports-loader?jQuery=jquery' }
            // { test: /datatables\.net.*/, use: 'imports-loader?define=>false'}
        ]
    },

    plugins: [
        new ExtractTextPlugin('common.css'),
        new LiveReloadPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
            moment: 'moment'
        })
    ]
};
