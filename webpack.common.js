const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (NODE_ENV) => {
    return {
        mode: NODE_ENV,
        entry: './client/main.ts',
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'app.bundle.js'
        },
        module: {
            rules: [{
                    test: /\.css$/,
                    use: ['css-loader']
                },
                {
                    test: /\.ts$/,
                    use: [
                        'ts-loader'
                    ]
                },
                {
                    test: /\.html$/,
                    use: [
                        'raw-loader'
                    ]
                },
                {
                    test: /\.less$/,
                    use: [{
                        loader: 'style-loader'
                    }, {
                        loader: 'css-loader'
                    }, {
                        loader: 'less-loader'
                    }]
                }
            ]
        },
        resolve: {
            extensions: [
                '.js',
                '.ts',
                '.html',
                '.css',
                '.less'
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './client/index.html'
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
                app: {
                    environment: JSON.stringify(NODE_ENV)
                }
            })
        ]
    }
}