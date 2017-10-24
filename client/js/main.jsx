/**
 * TOFLIT18 Client Main Entry
 * ===========================
 *
 * Launching the app.
 */
import React from 'react';
import {root} from 'baobab-react/higher-order';
import {render} from 'react-dom';
import AppRouter from './components/AppRouter.jsx';
import makeParrot from './parrot';
import client from './client';
import state from './state';

// Stylesheet
import 'ladda/dist/ladda-themeless.min.css';
import 'react-select/scss/default.scss';
import '../style/font-awesome.min.css';
import '../style/toflit18.scss';

// Binding client
let parrot = makeParrot(state, client);
state.client = client;

// Hot-reloading logic
if (module.hot) {
  module.hot.accept('./client', function() {
    parrot.release();

    const newClient = require('./client').default;
    state.client = newClient;
    parrot = makeParrot(state, newClient);
  });

  module.hot.accept('./parrot', function() {
    parrot.release();
    parrot = require('./parrot').default(state, state.client);
  });
}

// Initialize the app
const RootedApp = root(AppRouter, state);
render(<RootedApp />, document.getElementById('mount'));

module.exports = state;
