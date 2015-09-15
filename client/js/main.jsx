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
import client from './client';
import state from './state';

// Stylesheet
require('!style!css!sass!../style/toflit18.scss');

const RootedApp = root(App, state);

// Rendering the app
render(<RootedApp />, document.getElementById('mount'));

// Exposing the app for debugging purposes
state.client = client;
export default state;
