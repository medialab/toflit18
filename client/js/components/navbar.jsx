/**
 * TOFLIT18 Client NavBar Component
 * =================================
 *
 */
import React, {Component} from 'react';

const LINKS = [
  {
    label: 'Exploration',
    url: 'exploration'
  },
  {
    label: 'Collections',
    url: 'collections'
  }
];

export default class NavBar extends Component {
  render() {
    return (
      <div>
        <div className="navbar-emphasis" />
        <nav className="navbar navbar-light bg-faded">
          <div className="container">
            <a className="navbar-brand" href="#">TOFLIT18</a>
            <ul className="nav navbar-nav">
              {LINKS.map(l => (
                <li className="nav-item" key={l.url}>
                  <a className="nav-link" href="#">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
