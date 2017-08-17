const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AutoPrefixer = require('autoprefixer');
const path = require('path');
const StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
const tsconfig = require('./tsconfig.json');
const nodeExternals = require('webpack-node-externals');

function mkConfig(env = {}){
    // Utils to make config development easy
    const isProd = env.prod;
    const isDev = env.dev;
    if (!isProd && !isDev)
        throw new Error('No env.prod and no env.dev is defined / set to true!');
    const isBrowser = env.browser;
    const isNode = env.node;
    if (!isBrowser && !isNode)
        throw new Error('No env.browser and no env.node is defined / set to true!');
    const publicHost=env.publicHost;
    if(isBrowser&&!publicHost)
        throw new Error('Browser build with no env.publicHost declared!');

    const ifProd = plugin => isProd ? plugin : undefined;
    const ifDev = plugin => isDev ? plugin : undefined;
    const ifBrowser = plugin => isBrowser ? plugin : undefined;
    const ifNode = plugin => isNode ? plugin : undefined;
    const removeEmpty = array => (array instanceof Array) ? array.filter(p => !!p) : JSON.parse(JSON.stringify(array));
    const NODE_ENV = env.prod ? 'production' : 'development';
    const targetString = isBrowser ? 'browser' : 'node';

    // Common parts of compilation process
    const tsLoadingPipeline = removeEmpty([
        ifBrowser({
            loader: 'react-hot-loader/webpack'
        }),
        {
            loader: 'awesome-typescript-loader',
            query: {
                configFileName: path.join(__dirname, 'tsconfig.json')
            }
        }
    ]);
    const cssLoadingPipeline = [{
        loader: 'postcss-loader'
    }, {
        // Yep, it is wrong to process css with less. But it is for full pipeline shortening
        loader: "less-loader"
    }];

    // To make config composable
    let config= {
        target: isBrowser ? 'web' : 'node',
        node: {
            __dirname: false,
            __filename: false,
        },
        externals: isBrowser ? [] : [nodeExternals({
            whitelist: [/^@meteor-it/,/webpack/]
        })],
        devtool: 'source-map',
        entry: {
            app: removeEmpty([
                // ifBrowser(path.join(__dirname, '../frontend/entryPoint.js')),
                ifNode(path.join(__dirname, '../backend/entryPoint.js')),
                ifNode(ifDev('webpack/hot/poll?1000'))
            ]),
            // vendor: removeEmpty([
            //     // 'mobx',
            //     // ifBrowser('normalize.css'),

            //     // ifDev('react'),
            //     // ifDev('react-dom'),
            //     // TODO: Inferno router is like react router v3, waiting for v4
            //     // ('react-router'),
            //     // ('react-router-dom'),
            //     // ifProd('inferno'),
            //     // ifProd('inferno-compat'),
            //     //ifProd('inferno-router'),

            //     // ifDev('react-helmet'),
            //     // ifProd('inferno-helmet'),

            //     // ifDev('mobx-react'),
            //     // ifProd('inferno-mobx'),
            //     // ifDev(ifBrowser('mobx-react-devtools')),
            //     // ifBrowser(ifDev('react-hot-loader/patch')),
            //     // Hot reload on server side
            //     // Hot reload on client side
            //     // Connect to dev server
            //     ifBrowser(ifDev(`webpack-dev-server/client?${publicHost}`)),
            //     ifBrowser(ifDev('webpack/hot/only-dev-server'))
            // ])
        },

        resolve: {
            extensions: [
                // Code
                '.ts', '.tsx', '.js', '.jsx',
                // Data
                '.json', '.pds',
                // Styles
                '.css', '.scss', '.sass', '.less'
            ],
            alias: removeEmpty({
                // Inferno is very fast. TODO: Get rid of inferno-compat
                // 'react': ifProd('inferno-compat'),
                // 'react-dom/server': ifProd('inferno-server'),
                // 'react-dom': ifProd('inferno-compat'),
                //'react-router': ifProd('inferno-router'),
                //'react-router-dom': ifProd('inferno-router')
            }),
            // look at tsconfig.json, (it is used because tsconfig only supports json format)
            modules: tsconfig.compilerOptions.paths['*'].filter(path=>path!=='*').map(path=>path.substr(0,path.lastIndexOf('/*'))||path)
        },
        output: removeEmpty({
            libraryTarget: ifNode('commonjs'),
            filename: isProd?`[name].${targetString}.[hash].js`:`[name].${targetString}.js`,
            sourceMapFilename: isProd?`[name].${targetString}.[hash].map.js`:`[name].${targetString}.map.js`,
            path: path.join(__dirname, '../build/'),
            // I just don't like custom path for static files
            publicPath: ifBrowser('/')
        }),

        module: {
            loaders: [
                // Code
                {
                    test: /\.[jt]sx?$/,
                    // Because @meteor-it is linked
                    exclude: /(?:node_modules|\.node)/,
                    loader: tsLoadingPipeline,
                },
                // Styles
                // {
                //     test: /\.(?:less|css)$/,
                //     loader: isDev && isBrowser ?
                //     // In browser development build use style-loader for hot module reload
                //     [{
                //         loader: 'style-loader'
                //     }, {
                //         loader: "css-loader",
                //         query: {
                //             modules: true,
                //             minimize: isProd,
                //             localIdentName: isDev?'[local]':'[hash:base64:7]'
                //         }
                //     }, ...cssLoadingPipeline] :
                //     // In browser production build extract css to other file
                //     isProd && isBrowser? ExtractTextPlugin.extract({
                //         use: [{
                //             loader: "css-loader",
                //             query: {
                //                 modules: true,
                //                 minimize: isProd,
                //                 localIdentName: isDev?'[local]':'[hash:base64:7]'
                //             }
                //         }, ...cssLoadingPipeline],
                //         fallback: "style-loader"
                //     }):
                //     // In node build produce only locals
                //     isNode?[{
                //         loader: "css-loader/locals",
                //         query: {
                //             modules: true,
                //             minimize: isProd,
                //             // To see real class names in development
                //             localIdentName: isDev?'[local]':'[hash:base64:7]'
                //         }
                //     }, ...cssLoadingPipeline]:{error:'CSS'}
                // },
                // Assets
                // {
                //     test: /\.(png|jpg|otf|gif|jpeg)$/,
                //     loader: 'url-loader?limit=8192'
                // },
                // Protocol
                {
                    test: /\.(pds)$/,
                    loader: [...tsLoadingPipeline,'./webpack/protodefLoader']
                },
                // Data
                {
                    test: /\.ya?ml$/,
                    loader: ['yaml-import-loader'],
                },
            ],
        },

        plugins: removeEmpty([
            // Extract common chunks into vendor
            // ifBrowser(new webpack.optimize.CommonsChunkPlugin({
            //     name: 'commons',
            //     minChunks: Infinity,
            //     filename: isProd?`[name].${targetString}.[hash].js`:`[name].${targetString}.js`,
            // })),
            // // Compile html for react-dev-server (Get rid of it in future?)
            // ifBrowser(new HtmlWebpackPlugin({
            //     template: path.join(__dirname, '../frontend/index.html'),
            //     filename: 'index.html',
            //     inject: 'body',
            // })),
            // TODO: Get rid of this plugin
            new webpack.LoaderOptionsPlugin({
                minimize: isProd,
                debug: isDev,
                options: {
                    context: __dirname,
                    postcss: [AutoPrefixer({browsers: ['last 3 versions']})],
                },
            }),
            // React HMR
            ifDev(new webpack.HotModuleReplacementPlugin()),
            // Use strings instead of numbers in compiled code
            ifDev(new webpack.NamedModulesPlugin()),
            // ...
            new webpack.DefinePlugin({
                __DEVELOPMENT__: isDev,
                __BROWSER__: isBrowser,
                __NODE__: isNode,
                'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
                // For meteor-it code
                'process.env.ENV': JSON.stringify(NODE_ENV)
            }),
            // Extract css in production browser build
            // ifBrowser(ifProd(new ExtractTextPlugin({
            //     filename: '[name].browser.[hash].css'
            // }))),
            // Save filenames and other
            // new StatsWriterPlugin({
            //     // Different filenames for node and browser
            //     filename: isBrowser ? "stats.browser.json" : "stats.node.json",
            //     // null here = all fields
            //     fields: null,
            //     transform(stats) {
            //         // Get full file list for all built chunks
            //         let files = stats.chunks.map(chunk => chunk.files).reduce((a, b) => [...a, ...b]);
            //         return JSON.stringify(removeEmpty({
            //             // Eww... Why not? :D
            //             clientFiles: ifBrowser(files),
            //             serverFiles: ifNode(files),
            //             // Also... Why not? :D
            //             hash: stats.hash,
            //             webpackVersion: stats.version
            //         }), null, 4); // I want to have good idents
            //     }
            // }),
            // Minify and treeshake (I don't want to have 5mb website)
            // ifProd(new webpack.optimize.UglifyJsPlugin({
            //     compress: {
            //         // Hope internet explorer will die soon :D
            //         'screw_ie8': true,
            //         'warnings': false,
            //         'unused': true,
            //         // Treeshake
            //         'dead_code': true,
            //     },
            //     output: {
            //         comments: false,
            //     },
            //     // Source maps are not needed in production
            //     // TODO: Make it output, to decode frontend errors at server side
            //     sourceMap: false,
            // }))
        ]),
    };
    console.log(JSON.stringify(config));
    return config;
}

module.exports.mkConfig=mkConfig;
