var webpack = require('webpack'),
    path = require('path'),
    ProgressBar = require('progress'),
    _ = require('lodash');

var fmt = ' [:bar] :percent';

var bar = new ProgressBar(fmt, {
  total: 100,
  width: 30
});

module.exports = {
  devtool: '#cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './js/main.jsx'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
    library: 'app'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin(function(percentage, message) {
      bar.fmt = _.padRight((message || 'Done!'), 25, ' ') + fmt;
      bar.update(percentage);
    })
  ],
  module: {
    loaders: [

      // ES6 & JSX
      {
        test: /\.jsx?$/,
        include: [path.join(__dirname, 'js'), path.resolve(__dirname, '../lib')],
        loaders: ['babel-loader']
      },

      // JSON configuration file
      {
        test: /\.json$/,
        include: path.join(__dirname) + '/config.json',
        loader: 'json-loader'
      },

      // Fonts
      {
        test: /\.(ttf|eot|svg|woff2?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader'
      }
    ]
  }
};
