var path = require('path'),
    express = require('express'),
    webpack = require('webpack'),
    config = require('./webpack.config');

var app = express(),
    compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  // noInfo: true,
  stats: {
    colors: true
  },
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, 'localhost', function (err) {
  if (err) return console.err(err);
});
