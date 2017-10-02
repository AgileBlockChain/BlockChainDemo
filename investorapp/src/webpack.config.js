const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: './app/javascripts/app.js',
    summary: './app/javascripts/summary.js',
    details: './app/javascripts/details.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename:'[name].js' 
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" },
      { from: './app/registration.html', to: "registration.html" },
      { from: './app/summary.html', to: "summary.html"},
      { from: './app/details.html', to: "details.html"}
    ])
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.(png|jpg)$/,
        loader: 'url?limit=25000'
  },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  },

  devServer: {
     headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
     },
     // public:'0.0.0.0:8080',
     // host: '0.0.0.0',
     disableHostCheck: true   
  }       
}
