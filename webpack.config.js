module.exports = {
  module: {
    loaders: [

      // JSON configuration file
      {
        test: /\.json$/,
        loader: 'json'
      },

      // ES6 & JSX
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};
