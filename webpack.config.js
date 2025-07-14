const path = require('path');
const nodeExternals = require('webpack-node-externals');
const isProduction = process.env.NODE_ENV == 'production';
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
                    from: path.resolve(__dirname, 'README.md'), to: path.resolve(__dirname, 'dist'),
                    from: path.resolve(__dirname, 'views'), to: path.resolve(__dirname, 'dist', 'views')
                }
            ]
        })
    ]
};

const ui = {
    entry: {
        index: path.resolve(__dirname, 'src', 'ui', 'script', 'index.ts')
    },
    target: 'web',
    externalsPresets: { node: true },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist', 'ui', 'js'),
        library: 'lib',
        libraryTarget: 'window'
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
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src', 'ui', 'style'), to: path.resolve('dist', 'ui', 'style'),
                }
            ]
        })
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
    }
    return [backend, ui];
};
