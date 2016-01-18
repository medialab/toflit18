// Stylesheet
require('!style!css!ladda/dist/ladda-themeless.min.css');
require('!style!css!sass!react-select/scss/default.scss');
require('!style!css!rc-tooltip/assets/bootstrap.css');
require('!style!css!../../style/font-awesome.min.css');
require('!style!css!sass!../../style/toflit18.scss');

const context = require.context('./', true, /\.card\.jsx?$/);

context.keys().forEach(name => context(name));

module.hot.accept();
