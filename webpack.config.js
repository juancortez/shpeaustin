var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {

  entry: './client/main.ts',
  output: {
    path: './dist',
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: 'ts'},
      {test: /\.html$/, loader: 'raw'},
      {test: /\.css$/, loader: 'raw'},
      { 
        test: /.less$/, 
        exclude: [path.join(__dirname, '/node_modules'), /^\/node_modules$/, /node_modules/],
        include: path.join(__dirname, '/client/app/styles'), 
        loader: 'raw-loader!less-loader' 
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.html', '.css', '.less']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html'
    }),
    new webpack.DefinePlugin({
      app: {
        environment: JSON.stringify(process.env.APP_ENVIRONMENT || 'development')
      }
    }),
    new UglifyJsPlugin()
  ]

};
