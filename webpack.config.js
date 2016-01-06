module.exports = {
  module: {
    loaders: [

      // ES6 & JSX
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};
