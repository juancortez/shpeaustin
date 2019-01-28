var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {  
  entry:'./client/main.ts',
  output:{  
     path: path.resolve(__dirname, './dist'),
     filename:'app.bundle.js'
  },
  module:{  
     rules:[
       {
        test: /\.css$/,
        use: ['css-loader']
       },
        {  
           test:/\.ts$/,
           use:[  
              'ts-loader'
           ]
        },
        {  
           test:/\.html$/,
           use:[  
              'raw-loader'
           ]
        },
        {  
           test: /\.less$/,
           use: [{
              loader: 'style-loader' // creates style nodes from JS strings
            }, {
              loader: 'css-loader' // translates CSS into CommonJS
            }, {
              loader: 'less-loader' // compiles Less to CSS
            }]
        }
     ]
  },
  resolve:{  
     extensions:[
        '.js',
        '.ts',
        '.html',
        '.css',
        '.less'
     ]
  },
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins:[  
     new HtmlWebpackPlugin({  
      template:'./client/index.html'
     }),
     new webpack.DefinePlugin({  
        'process.env.NODE_ENV':JSON.stringify("production"),
        app:{  
           environment:JSON.stringify(process.env.APP_ENVIRONMENT || 'development')
        }
     }),
     new webpack.HotModuleReplacementPlugin()
     //new UglifyJsPlugin()
  ]
};
