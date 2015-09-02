/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import Addressbar from 'react-addressbar';

export default class App extends Component {
  onHashChange(url) {
    const hash = location.hash;
  }

  render() {
    return (
      <div id="main">
        <Addressbar onChange={this.onHashChange}
                    value="/#/home" />
        Hello World!
      </div>
    );
  }
}
