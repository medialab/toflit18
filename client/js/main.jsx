/**
 * TOFLIT18 Client Main Entry
 * ===========================
 *
 * Launching the app.
 */
import React from 'react';
import {root} from 'baobab-react/higher-order';
import {render} from 'react-dom';
import App from './components/app.jsx';
import makeParrot from './parrot';
import client from './client';
import state from './state';

// Stylesheet
require('!style!css!sass!../style/toflit18.scss');

const RootedApp = root(App, state);

// Rendering the app
render(<RootedApp />, document.getElementById('mount'));

// Binding client
let parrot = makeParrot(state, client);
state.client = client;

// Hot-reloading logic
if (module.hot)  {
  module.hot.accept('./client', function() {
    parrot.release();

    const newClient = require('./client');
    state.client = newClient;
    parrot = makeParrot(state, newClient);
  });

  module.hot.accept('./parrot', function() {
    parrot.release();
    parrot = require('./parrot')(state, state.client);
  });
}

export default state;
