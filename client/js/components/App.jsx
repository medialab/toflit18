/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import Header from './Header.jsx';

export default class App extends Component {
  render() {
    return (
      <div id="main">
        <Header />
        {this.props.children}
      </div>
    );
  }
}
