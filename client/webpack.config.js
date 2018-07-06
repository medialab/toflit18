var webpack = require('webpack'),
    config = require('config'),
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
  devtool: 'cheap-module-eval-source-map',
  entry: './js/main.jsx',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
    library: 'app'
  },
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(config)
    })
  ],
  module: {
    rules: [

      // ES6 & JSX
      {
        test: /\.jsx?$/,
        include: [path.join(__dirname, 'js'), path.resolve(__dirname, '../lib')],
        loader: 'babel-loader',
        options: {
          presets: PRESETS,
          plugins: [require.resolve('babel-plugin-transform-decorators-legacy')]
        }
      },

      // Style
      {
        test: /\.scss?$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },

      // Fonts
      {
        test: /\.(ttf|eot|svg|woff2?)(\?[a-z0-9.=]+)?$/,
        loader: 'file-loader'
      },

      // Images
      {
        test: /\.(gif|png|jpg|jpeg)$/,
        loader: 'file-loader'
      }
    ]
  }
};
