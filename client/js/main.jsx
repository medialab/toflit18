/**
 * TOFLIT18 Client Main Entry
 * ===========================
 *
 * Launching the app.
 */
import React from 'react';
import {render} from 'react-dom';
import App from './components/app.jsx';
import tree from './tree';

// Stylesheet
require('!style!css!sass!../style/toflit18.scss');

// Rendering the app
render(<App />, document.getElementById('mount'));

// Exposing the app for debugging purposes
export default tree;
