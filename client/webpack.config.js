var webpack = require('webpack'),
    path = require('path');

module.exports = {
  devtool: '#source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:2000',
    'webpack/hot/only-dev-server',
    './js/main.jsx'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
    library: 'app'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [

      // ES6 and jsx
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loaders: ['babel-loader']
      },

      // JSON configuration file
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json-loader'
      }
    ]
  }
};
