var webpack = require('webpack'),
    path = require('path');

var PRESETS = [
  'es2015',
  'stage-0',
  'react',
  'react-hmre'
];

PRESETS.forEach(function(p, i) {
  PRESETS[i] = require.resolve('babel-preset-' + p);
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
      var txt = ((percentage * 100) | 0) + '% - ' + message;

      console.log(txt);
    })
  ],
  module: {
    loaders: [

      // ES6 & JSX
      {
        test: /\.jsx?$/,
        include: [path.join(__dirname, 'js'), path.resolve(__dirname, '../lib')],
        loader: 'babel',
        query: {
          presets: PRESETS,
          plugins: [require.resolve('babel-plugin-transform-decorators-legacy')]
        }
      },

      // JSON configuration file
      {
        test: /\.json$/,
        include: path.join(__dirname, 'config.json'),
        loader: 'json'
      },

      // Fonts
      {
        test: /\.(ttf|eot|svg|woff2?)(\?[a-z0-9.=]+)?$/,
        loader: 'file'
      }
    ]
  }
};
