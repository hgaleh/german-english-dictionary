const path = require('path');
const nodeExternals = require('webpack-node-externals');
const isProduction = process.env.NODE_ENV == 'production';
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const backend = {
    entry: {
        index: path.resolve(__dirname, 'src', 'backend', 'index.ts')
    },
    target: 'node16',
    externalsPresets: { node: true },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        open: true,
        host: 'localhost',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, 'tsconfig.backend.json')
                    }
                },
                exclude: ['/node_modules/'],
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    externals: [
        nodeExternals({
            importType: function (moduleName) {
                return `commonjs ${moduleName}`
            }
        })
    ],
    plugins: [
        // new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'README.md'), to: path.resolve(__dirname, 'dist')
                }
            ]
        })
    ]
};

const ui = {
    entry: {
        ui: './src/ui/ui.tsx'
    },
    target: 'web',
    externalsPresets: { node: true },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist', 'ui')
    },
    devServer: {
        open: true,
        host: 'localhost',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, 'tsconfig.ui.json')
                    }
                },
                exclude: ['/node_modules/'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        // options: {
                        //     modules: {
                        //         localIdentName: '[hash:base64:5]_[local]'
                        //     },
                        //     esModule: false
                        // }
                    },
                    'postcss-loader',
                    'sass-loader'
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            chunks: ['ui'],
            template: './src/ui/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css', // Name of the output CSS file
            chunkFilename: '[id].css',
        }),
    ]
}

module.exports = () => {
    if (isProduction) {
        backend.mode = 'production';
        ui.mode = 'production';
    } else {
        ui.mode = 'development';
        ui.devtool = 'source-map';
        backend.mode = 'development';
        backend.devtool = 'source-map';
        backend.plugins.push(new NodemonPlugin({
            script: './dist/index.js',
            watch: path.resolve('./dist'),
            delay: '200',
            ext: 'js,json,ejs,css',
            nodeArgs: ['--inspect']
        }))
    }
    return [backend, ui];
};
