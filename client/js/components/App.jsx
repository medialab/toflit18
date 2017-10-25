/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default class App extends Component {
  render() {
    return (
      <div id="main">
        <Header />
        <main className="container">
          {this.props.children}
        </main>
        <Footer />
      </div>
    );
  }
}
