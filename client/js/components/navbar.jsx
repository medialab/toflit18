/**
 * TOFLIT18 Client NavBar Component
 * =================================
 *
 */
import React, {Component} from 'react';

export default class NavBar extends Component {
  render() {
    return (
      <div>
        <div className="navbar-emphasis" />
        <nav className="navbar navbar-light bg-faded">
          <div className="container">
            <a className="navbar-brand" href="#">TOFLIT18</a>
          </div>
        </nav>
      </div>
    );
  }
}
