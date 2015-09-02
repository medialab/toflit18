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
  module: {
    loaders: [

      // ES6
      {
        test: /\.js$/,
        include: path.join(__dirname, 'js'),
        loaders: ['babel-loader']
      },

      // JSX
      {
        test: /\.jsx$/,
        include: path.join(__dirname, 'js'),
        loaders: ['react-hot', 'babel-loader']
      },

      // JSON configuration file
      {
        test: /\.json$/,
        include: path.join(__dirname) + '/config.json',
        loader: 'json-loader'
      }
    ]
  }
};
