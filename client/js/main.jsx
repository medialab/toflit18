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
import {checkSession} from './actions/session';
import makeParrot from './parrot';
import client from './client';
import state from './state';

// Stylesheet
import 'ladda/dist/ladda-themeless.min.css';
import 'react-select/scss/default.scss';
import 'rc-tooltip/assets/bootstrap.css';
import '../style/font-awesome.min.css';
import '../style/toflit18.scss';

// Binding client
let parrot = makeParrot(state, client);
state.client = client;

// Checking the user's session
checkSession(state, () => {
  const RootedApp = root(AppRouter, state);

  // Rendering the app
  render(<RootedApp />, document.getElementById('mount'));
});

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

module.exports = state;
