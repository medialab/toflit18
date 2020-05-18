/**
 * TOFLIT18 Client Application Root
 * ================================
 */
import React, {Component} from 'react';
import PropTypes from 'baobab-react/prop-types';
import App from './App.jsx';

export default class Root extends Component {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {
    return <App />;
  }
}
